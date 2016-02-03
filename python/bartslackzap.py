import json

triggerWord = 'yobart'
command = input['text'].replace(triggerWord, '').strip()
apiUrl = 'http://bart.crudworks.org/api'
message = ''

if command == 'help':
    message = '*' + triggerWord + ' status* - number of trains operating, any system wide messages\n' \
            + '*' + triggerWord + ' elevators* - network-wide elevator service status\n' \
            + '*' + triggerWord + ' stations* - show station codes \n' \
            + '*' + triggerWord + ' <CODE>* - show departures for station having station code <CODE> e.g. POWL\n' \
            + '*' + triggerWord + ' help* - list available commands\n'
elif command == 'stations':
    res = requests.get(apiUrl + '/stations')
    res.raise_for_status()
    stationsJson = json.loads(res.text)
    message = '*BART Station Codes I know about:*\n\n'
    stationCodes = []
    for station in stationsJson:
        stationCodes.append(station['abbr'])

    message += ', '.join(stationCodes)
elif command == 'status':
    res = requests.get(apiUrl + '/status')
    res.raise_for_status()
    statusJson = json.loads(res.text)
    message = statusJson['time'] + ': ' + statusJson['traincount'] + ' trains operating. ' + statusJson['message']
elif command == 'elevators':
    res = requests.get(apiUrl + '/elevatorStatus')
    res.raise_for_status()
    elevatorJson = json.loads(res.text)
    message = elevatorJson['bsa']['description']
else:
    if (len(command) == 4):
        res = requests.get(apiUrl + '/departures/' + command)
        res.raise_for_status()
        departuresJson = json.loads(res.text)
        if 'etd' in departuresJson:
            message = '*Trains from ' + departuresJson['name'] + '*\n'
            for destination in departuresJson['etd']:
                message += '\n*Towards ' + destination['destination'] + ' (Platform TODO):*\n\n';
                for estimate in destination['estimate']:
                    message += 'TODO ' + estimate['length'] + ' cars.\n'
        else:
            message = 'Sorry I don\'t know about station ' + command
    else:
        message = 'Unknown command.  Use ' + triggerWord + ' help for a list of commands.'

output = [{'text': message, 'channel': input['channel']}]
return output