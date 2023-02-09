import pymysql
from app import app
from config import mysql
from flask import jsonify, Flask, request


@app.errorhandler(404)
def showMessage(error=None):
    message = {
        'status': 404,
        'message': 'Record not found: ' + request.url,
    }
    respone = jsonify(message)
    respone.status_code = 404
    return respone


@app.route("/createTranscript", methods=["post"])
def create_transcript():
    try:
        _json = request.json
        _transcript = _json['transcript']
        if _transcript and request.method == "POST":
            conn = mysql.connect()
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            sqlQuery = "INSERT INTO transcripts(transcript) VALES(%s)"
            bindData = (_transcript)
            cursor.execute(sqlQuery, bindData)
            conn.commit()
            response = jsonify("Transcript added successfully!")
            response.status_code = 200
            return response
        else:
            return showMessage()
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route("/transcripts")
def transcript():
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(
            "SELECT id, transcript FROM transcripts")
        empRows = cursor.fetchall()
        respone = jsonify(empRows)
        respone.status_code = 200
        return respone
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/transcripts/')
def transcript_details(transcript_id):
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(
            "SELECT id, transcript FROM transcripts WHERE id =%s", transcript_id)
        empRow = cursor.fetchone()
        respone = jsonify(empRow)
        respone.status_code = 200
        return respone
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()
