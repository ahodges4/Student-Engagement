import os
import sys
from flask_cors import CORS, cross_origin
import pymysql
from flaskext.mysql import MySQL
from flask import jsonify, Flask, request
from audioStream import AudioStream
from question_generation.main import Question_Generator
import asyncio
import traceback

app = Flask(__name__)

activeAudioStreams = {}

Qgen = Question_Generator()

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
        cursor.execute("SELECT * FROM transcripts WHERE id = %s", (id,))
        result = cursor.fetchone()
        if result == None:
            return jsonify({'error': 'No transcript with that ID'})
        cursor.execute(
            "UPDATE transcripts SET transcript = %s WHERE id = %s", (transcript, id))
        conn.commit()
        return jsonify({'message': 'Transcript updated successfully'})
    except:
        return jsonify({'error': 'Failed to update transcript'})


@app.route('/openAudioStream', methods=['POST'])
async def open_audio_stream():
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
        activeAudioStreams[transcriptID] = NewAudioStream
        NewAudioStream.start_in_loop()

        print("Audio Stream created")
        return jsonify({"audioStreamID": transcriptID})
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to create audio stream : ' + str(e)})


@app.route('/closeAudioStream/<id>', methods=['POST'])
def closeAudioStream(id):
    # print(activeAudioStreams)

    try:
        activeAudioStreams[id].running = False
        del activeAudioStreams[id]
        return jsonify({"200": "OK"})
    except Exception as e:
        print(e)
        return jsonify({"Error : ": str(e)})

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


# Requires body of input_text
@app.route('/generateQuestions', methods=['POST'])
def generate_questions():
    try:
        text = request.get_json()

        questions = Qgen.generate_MCQs(text)

        return questions

    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to create questions : ' + str(e)})

# Requires body of id


@app.route('/generateTranscriptQuestions/<id>', methods=['POST'])
def generate_questions_from_transcripts(id):
    try:
        cursor.execute("SELECT * FROM transcripts WHERE id = %s", (id,))
        result = cursor.fetchone()
        if result == None:
            return jsonify({"error": "Transcript not found with ID " + str(id)})
        print(result["transcript"])
        text = {"input_text": result["transcript"]}

        questions = Qgen.generate_MCQs(text)

        return questions

    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to create questions of transcript : ' + str(e)})


if __name__ == '__main__':
    app.run()
