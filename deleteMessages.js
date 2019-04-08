//Paste this function in DevTools console inside Discord

function deleteMessages(authToken, authorId, channelId, firstMessageId) {
  const start = new Date();
  const delayDelete = 500;
  const delaySearch = 1000;
  let delCount = 0;
  let failCount = 0;
  let estimatedPing = 220;
  let grandTotal;
  const history = [];

  const wait = async (ms) => new Promise(done => setTimeout(done, ms));
  const msToHMS = (s) => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;

  function log() { history.push(arguments); console.log.apply(console, arguments); pp.insertAdjacentHTML('beforeend', `<div style='color:black;'>${Array.from(arguments).map(o => typeof o === 'object' ? JSON.stringify(o) : o).join('\t')}</div>`); popup.scrollBy(0, 1e10); };
  function error() { history.push(arguments); console.error.apply(console, arguments); pp.insertAdjacentHTML('beforeend', `<div style='color:red;'>${Array.from(arguments).map(o => typeof o === 'object' ? JSON.stringify(o) : o).join('\t')}</div>`); popup.scrollBy(0, 1e10); };
  var popup = window.open('', '', 'width=800,height=1000,top=0,left=0');
  popup.document.body.innerHTML = '<pre></pre>';
  const pp = popup.document.getElementsByTagName('pre')[0];
  if (!popup) console.error('Popup blocked!');

  log(`---- You can abort by setting STOP=1 on the console ----`);
  log(`Starting at ${start}, channelId=${channelId} authorId=${authorId} firstMessageId=${firstMessageId}`);
  recurse();

  async function recurse() {
    const headers = {
      "Authorization": authToken
    };
    const deleteAfter = `search?author_id=${authorId}` + (firstMessageId ? `&min_id=${firstMessageId}` : '');
    const baseURL = `https://discordapp.com/api/v6/channels/${channelId}/messages/`;

    let resp;
    try {
      resp = await fetch(baseURL + deleteAfter, {
        headers
      });
    }
    catch (err) {
      error('Something went wrong!', err);
      return;
    }
    const result = await resp.json();

    const total = result.total_results;
    if (!grandTotal) grandTotal = total;
    log(`Messages to delete: ${result.total_results}`, `Time remaining: ${msToHMS((delaySearch * Math.round(total / 25)) + ((delayDelete + estimatedPing) * total))} (ping: ${estimatedPing << 0}ms)`);

    if (result.total_results > 0) {
      for (let i = 0; i < result.messages.length; i++) {
        const element = result.messages[i];
        for (let j = 0; j < element.length; j++) {
          const message = element[j];

          if (window.STOP) return error('STOPPED! (If you want to continue set STOP=0 and run again!');

          if (message.type === 3) {
            log('System message?', message);
          }
          else if (message.author.id == authorId && message.hit == true) {

            log(`${((delCount + 1) / grandTotal * 100).toFixed(2)}% (${delCount + 1}/${grandTotal}) Deleting ID:${message.id}`,
              `[${new Date(message.timestamp).toLocaleString()}] ${message.author.username}#${message.author.discriminator}: ${message.content}`,
              message.attachments.length ? message.attachments : '');
            const s = Date.now();
            try {
              await fetch(baseURL + message.id, {
                headers,
                method: "DELETE"
              });
              delCount++;
            } catch (err) {
              error('Failed to delete message:', message, 'Error:', err);
              failCount++;
            }
            estimatedPing = (estimatedPing + (Date.now() - s)) / 2;
            await wait(delayDelete);
          }
        }
      }
      log('Getting next messages...');
      await wait(delaySearch);
      return recurse();
    }
    else {
      const msg = `Everything is clear!\n Messages deleted: ${delCount} Failed: ${failCount} \n Total time: ${msToHMS(Date.now() - start.getTime())}`;
      log(msg);
      return result;
    }
  }
}
