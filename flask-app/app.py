
from flask_cors import CORS, cross_origin
import pymysql
from flaskext.mysql import MySQL
from flask import jsonify, Flask, request
from audioStream import AudioStream
from question_generation.main import Question_Generator
import asyncio
import traceback
import socket
from dotenv import load_dotenv
import os


app = Flask(__name__)

load_dotenv()

db_host = os.environ.get("DB_HOST")
db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")

activeAudioStreams = {}

Qgen = Question_Generator()

# Enable CORS to allow cross-origin requests
CORS(app)

# Connect to the database
conn = pymysql.connect(
    host=db_host,
    user=db_user,
    password=db_password,
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

        transcriptID = cursor.lastrowid

        return jsonify({'transcript_id': transcriptID})
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


@app.route('/transcripts/<id>', methods=['DELETE'])
def deleteTranscript(id):
    try:
        conn.begin()
    except:
        return jsonify({"error": "Delete Transcript: Could not start transaction"})

    try:
        lecture_id = int(id)
    except ValueError:
        conn.rollback()
        return jsonify({"error": "Could not delete Transcript: ID is not a valid integer"})

    try:
        cursor.execute(
            "DELETE FROM transcripts WHERE id = %s", (id,))
        cursor.execute(
            "DELETE FROM lecture_transcripts WHERE transcript_id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Transcript deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Could not delete transcript: {}".format(str(e))})


def get_next_available_port(start_port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    port = start_port
    while True:
        try:
            sock.bind(("localhost", port))
            sock.close()
            return port
        except OSError:
            port += 1


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
        port = get_next_available_port(8000)
        print("On port: " + str(port))
        NewAudioStream = AudioStream(transcriptID, port)
        activeAudioStreams[transcriptID] = NewAudioStream
        NewAudioStream.start_in_loop()

        print("Audio Stream created")
        return jsonify({"audioStreamID": transcriptID, "port": port})
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to create audio stream : ' + str(e)})


@app.route('/stopAudioStream/<int:audioStreamID>', methods=['POST'])
async def stop_audio_stream(audioStreamID):
    try:
        # get the audio stream for the specified ID
        audioStream = activeAudioStreams.get(audioStreamID)

        # stop the audio stream
        if audioStream is not None:
            audioStream.stop()
            del activeAudioStreams[audioStreamID]

        return jsonify({'success': True})
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error: {e}\n{tb}")
        return jsonify({'error': 'Failed to stop audio stream : ' + str(e)})


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


@app.route('/lectures', methods=['GET'])
def get_lectures():
    cursor.execute("SELECT * FROM lectures")
    lectures = cursor.fetchall()
    return jsonify(lectures)


@app.route('/lectures/<id>', methods=['GET'])
def get_lecture(id):
    cursor.execute("SELECT * FROM lectures WHERE id = %s", (id,))
    result = cursor.fetchone()

    if result:
        return jsonify(result)
    else:
        return jsonify({'error': 'Lecture not found'})


@app.route('/lectures', methods=['POST'])
def create_lecture():
    try:
        lecture_url = request.get_json()['lecture_url']
        lecture_title = request.get_json()['lecture_title']
    except:
        return jsonify({'error': 'Failed to create lecture'})
    # Execute the INSERT query
    try:
        cursor.execute(
            "INSERT INTO lectures (lecture_url, lecture_title) VALUES (%s,%s)", (lecture_url, lecture_title))
        conn.commit()
        return jsonify({'message': 'Lecture created successfully'})
    except:
        return jsonify({'error': 'Failed to create lecture'})


@app.route('/lecture_transcripts', methods=['GET'])
def get_lecture_transcripts():
    cursor.execute("SELECT * FROM lecture_transcripts")
    lecture_transcripts = cursor.fetchall()
    return jsonify(lecture_transcripts)


@app.route('/lecture_transcripts/<id>', methods=['GET'])
def get_transcript_IDs_from_Lecture_ID(id):
    cursor.execute(
        "SELECT * FROM lecture_transcripts WHERE lecture_id = %s", (id,))
    result = cursor.fetchall()

    if result:
        return jsonify(result)
    else:
        return jsonify({'error': 'Lecture IDs not found'})


@app.route('/lecture_transcripts', methods=['POST'])
def create_lecture_transcript():
    try:
        transcript_ids = request.get_json()["transcript_ids"]
        lecture_id = request.get_json()["lecture_id"]
    except:
        return jsonify({'error': 'Failed to create lecture_transcripts'})

    if isinstance(transcript_ids, int):
        cursor.execute(
            "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lecture_id, transcript_ids))
        conn.commit()
    elif isinstance(transcript_ids, list):
        for transcript_id in transcript_ids:
            cursor.execute(
                "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lecture_id, transcript_id))
        conn.commit()
    else:
        return jsonify({'error': 'Failed to create lecture_transcripts. transcript_ids is not a number or list'})
    return jsonify({'message': 'Lecture_transcript created successfully'})


@app.route('/changeLectureRecording', methods=['PUT'])
def updateLectureRecording():
    try:
        conn.begin()
        lectureID = request.get_json()["lecture_id"]
        lectureTitle = request.get_json()["lecture_title"]
        lectureURL = request.get_json()["lecture_url"]
        transcriptIDs = request.get_json()["transcript_ids"]
    except Exception as e:
        conn.rollback()
        return jsonify({'error': "Failed to update Lecture Recording {}".format(str(e))})

    # Delete all current relationships
    try:
        cursor.execute(
            "DELETE FROM lecture_transcripts WHERE lecture_id = %s", (lectureID,))

    except:
        conn.rollback()
        return jsonify({"error": "Could not delete existing relationships"})

    # Update existing lecture information
    try:
        cursor.execute("UPDATE lectures SET lecture_url = %s, lecture_title = %s WHERE id = %s",
                       (lectureURL, lectureTitle, lectureID))

    except:
        conn.rollback()
        return jsonify({"error": "Could not update existing lecture information"})

    # Make new relationships
    try:
        if isinstance(transcriptIDs, int):
            cursor.execute(
                "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lectureID, transcriptIDs))

        elif isinstance(transcriptIDs, list):
            for transcript_id in transcriptIDs:
                cursor.execute(
                    "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lectureID, transcript_id))

        else:
            conn.rollback()
            return jsonify({'error': 'Failed to create lecture_transcripts. transcript_ids is not a number or list'})

    except:
        conn.rollback()
        return jsonify({"error": "Could not create new relationships"})

    conn.commit()
    return jsonify({"message": "Lecture updated successfully"})


@app.route('/lectures/<id>', methods=['DELETE'])
def deleteLecture(id):
    try:
        conn.begin()
    except:
        return jsonify({"error": "Delete Lecture: Could not start transaction"})

    try:
        lecture_id = int(id)
    except ValueError:
        conn.rollback()
        return jsonify({"error": "Could not delete lecture: ID is not a valid integer"})

    try:
        cursor.execute(
            "DELETE FROM lecture_transcripts WHERE lecture_id = %s", (id,))
        cursor.execute("DELETE FROM lectures WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Lecture deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Could not delete lecture: {}".format(str(e))})


@app.route('/newLecture', methods=['POST'])
def createNewLecture():
    try:
        conn.begin()
        lectureTitle = request.get_json()["lecture_title"]
        lectureURL = request.get_json()["lecture_url"]
        transcriptIDs = request.get_json()["transcript_ids"]

        cursor.execute(
            "INSERT INTO lectures (lecture_url, lecture_title) VALUES (%s,%s)", (lectureURL, lectureTitle))
        lectureID = cursor.lastrowid

        if isinstance(transcriptIDs, int):
            cursor.execute(
                "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lectureID, transcriptIDs))
        elif isinstance(transcriptIDs, list):
            for transcript_id in transcriptIDs:
                cursor.execute(
                    "INSERT INTO lecture_transcripts (lecture_id, transcript_id) VALUES (%s, %s)", (lectureID, transcript_id))
        else:
            conn.rollback()
            return jsonify({'error': 'Failed to create lecture_transcripts. transcript_ids is not a number or list'})

        conn.commit()
        return jsonify({"message": "New lecture created successfully"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": "New Lecture: Failed to create new lecture. Error message: {}".format(str(e))})


if __name__ == '__main__':
    app.run()
