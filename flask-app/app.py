import os
import sys
from flask_cors import CORS, cross_origin
import pymysql
from flaskext.mysql import MySQL
from flask import jsonify, Flask, request
from audioStream import AudioStream
import asyncio
import traceback

app = Flask(__name__)

activeAudioStreams = {}

# Enable CORS to allow cross-origin requests
CORS(app)

# Connect to the database
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='bestHand',
    db="student-engagement",
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

# Create a cursor to interact with the database
cursor = conn.cursor()

# Get all transcripts


@app.route('/transcripts', methods=['GET'])
def get_transcripts():
    # Execute the SELECT query
    cursor.execute("SELECT * FROM transcripts")
    results = cursor.fetchall()
    return jsonify(results)

# Get a specific transcript by its ID


@app.route('/transcripts/<id>', methods=['GET'])
def get_transcript(id):
    # Execute the SELECT query
    cursor.execute("SELECT * FROM transcripts WHERE id = %s", (id,))
    result = cursor.fetchone()

    if result:
        return jsonify(result)
    else:
        return jsonify({'error': 'Transcript not found'})

# Create a new transcript


@app.route('/transcripts', methods=['POST'])
def create_transcript():
    # Get the transcript from the request body
    transcript = request.get_json()['transcript']

    # Execute the INSERT query
    try:
        cursor.execute(
            "INSERT INTO transcripts (transcript) VALUES (%s)", (transcript,))
        conn.commit()
        return jsonify({'message': 'Transcript created successfully'})
    except:
        return jsonify({'error': 'Failed to create transcript'})

# Update a transcript using its ID


@app.route('/transcripts/<id>', methods=['PUT'])
def update_transcript(id):
    # Get the updated transcript from the request body
    transcript = request.get_json()['transcript']

    # Execute the UPDATE query
    try:
        cursor.execute(
            "UPDATE transcripts SET transcript = %s WHERE id = %s", (transcript, id))
        conn.commit()
        return jsonify({'message': 'Transcript updated successfully'})
    except:
        return jsonify({'error': 'Failed to update transcript'})


@app.route('/openAudioStream', methods=['POST'])
def open_audio_stream():
    # Insert a new transcript record with an empty transcript field
    try:
        cursor.execute(
            "INSERT INTO transcripts (transcript) VALUES (null)")
        conn.commit()

        # get the ID of the newly created record
        transcriptID = cursor.lastrowid

        # start audio stream
        print("Creating Audio Stream")
        NewAudioStream = AudioStream(transcriptID)
        NewAudioStream.start()
        print("Audio Stream created")
        return jsonify({"audioStreamID": transcriptID})
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to create audio stream : ' + str(e)})


# @app.route('/closeAudioStream/<id>', methods=['GET'])
# def close_audio_stream(id):
#     if id in activeAudioStreams:
#         del activeAudioStreams[id]
#         return jsonify({"message": "Instance with ID {} closed successfully".format(id)})
#     else:
#         return jsonify({"error": "Instance with ID {} not found".format(id)})


@app.route('/getCurrentTranscript/<id>', methods=['GET'])
def get_current_transcript(id):
    if id in activeAudioStreams:
        return jsonify({"transcript": "{}".format(activeAudioStreams[id].transcript)})


if __name__ == '__main__':
    app.run()
