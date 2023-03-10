@echo off

echo Installing required packages...
pip install -r flask-app/requirements.txt

echo Starting student-engagement app...
start powershell.exe -noexit -command "cd student-engagement; npm run start"

echo Starting flask-app...
start powershell.exe -noexit -command "cd flask-app; flask run"