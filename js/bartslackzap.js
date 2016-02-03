var command = input.text.toLowerCase().trim(),
    apiUrl = 'http://bart.crudworks.org/api',
    triggerWord = 'heybart';

command = command.replace(triggerWord, '').trim();

switch(command) {
  case 'help':
    callback(
      null, 
      { 
        channel: input.channel, 
        text: '*Commands I know about:*\n\n' 
                + '*' + triggerWord + ' status* - number of trains operating, any system wide messages\n'
                + '*' + triggerWord + ' elevators* - network-wide elevator service status\n'
                + '*' + triggerWord + ' stations* - show station codes \n'
                + '*' + triggerWord + ' <CODE>* - show departures for station having station code <CODE> e.g. POWL\n'
                + '*' + triggerWord + ' help* - list available commands\n'
      }
    );
    break;
  case 'stations':
    fetch(apiUrl + '/stations')
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        var stationListMessage = '*BART Station Codes I know about:*\n\n';
        var n = 0;
      
        for (; n < json.length; n++) {
          if (n > 0) { 
            stationListMessage += ', ';
          }
          stationListMessage += json[n].abbr;
        }
      
        callback(
          null, 
          { 
            channel: input.channel, 
            text: stationListMessage 
          }
        );
      })
      .catch(callback);
    break;
  case 'status':
    fetch(apiUrl + '/status')
          .then(function(res) {
            return res.json();
          })
          .then(function(json) {
            var statusMessage = json.time + ': ' + json.traincount + ' trains operating. ' + json.message;
            callback(
              null, 
              { 
                channel: input.channel, 
                text: statusMessage 
              }
            );
          })
          .catch(callback);
    break;
  case 'elevators':
    fetch(apiUrl + '/elevatorStatus')
      .then(function(res) {
        return res.json();
      })
      .then(function(json) {
        callback(
          null, 
          { 
            channel: input.channel, 
            text: json.bsa.description 
          }
        );
      })
      .catch(callback);
    break;
  default:
    // Assume it is a station until proven otherwise.
    if (command.length === 4) { 
      fetch(apiUrl + '/departures/' + command)
        .then(function(res) {
          return res.json();
        })
        .then(function(json) {
          var statusMessage,
              n, m, destination, estimate;

          if (json && json.etd) {
            statusMessage = '*Trains from ' + json.name + '*\n';
            for (n = 0; n < json.etd.length; n++) {
              destination = json.etd[n];
              statusMessage += '\n*Towards ' + destination.destination + ' (Platform ' + destination.estimate[0].platform + '):*\n\n';
              for (m = 0; m < destination.estimate.length; m++) {
                estimate = destination.estimate[m];
                if (estimate.minutes === 'Leaving') {
                  statusMessage += ':exclamation: Leaving:';
                } else {
                  statusMessage += (parseInt(estimate.minutes) < 5 ? ':alarm_clock: ' : ':light_rail: ');
                  statusMessage += estimate.minutes + (estimate.minutes == 1 ? ' minute:' : ' minutes:');
                }
                statusMessage += ' ' + estimate.length + ' cars.\n';       
              }
            }
          } else {
            statusMessage = 'Sorry I don\'t know about station ' + command; 
          }
          callback(
            null, 
            { 
              channel: input.channel, 
              text: statusMessage 
            }
          );
        })
        .catch(callback);
    } else {
      callback(
        null, 
        { 
          channel: input.channel, 
          text: 'Unknown command.  Use ' + triggerWord + ' help for a list of commands.' 
        }
      );
    }
};  