const ipc = require('electron').ipcRenderer;


var tag = {
    title_of_group : "#main > header > div._33QME > div._2FCjS > div > span",
    group_header_contact_list : "#main > header > div._33QME > div._2ruUq._3xjAz > span",
    group_id : "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div._2Bps4._1mTqm._1pDAt > div._1005i > span",
    more_caret : "._3X7RF > span",
    participants_number : "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div:nth-child(5) > div._1Gecv > div > div > div._3HPyS._1e77x > span",
    group_info : "._3vTfY",
    scroll : "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div",
    contact : "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div:nth-child(5) ._210SC",
    name : "._1_1Jb > ._3Whw5",
    send_button : "._1U1xa",
    chat_dom : "._2hqOq"
};

ipc.on('grabb-contact', () => {

    console.log('cook bosku')
    var data = [];
    var counter = 0;
    var id = document.querySelector(tag.group_id)
   
    // select carent on more
    var have_more = document.querySelector(tag.more_caret);
    

    if(have_more)
    {   
        ipc.sendToHost('grabb-failed','Klik More Sehingga Semua Kontak Terbuka');
      
        return;
      
    }
    if (!id) {
        ipc.sendToHost('grabb-failed','Mohon Buka Group Info untuk memulai grabbing');
        return;
    } else {
        
        var member_numbers = parseInt(document.querySelector(tag.participants_number).innerText.split(' ')[0]);
        
        ipc.sendToHost('member_numbers',member_numbers)

        document.querySelector(tag.group_info).innerHTML = '<small>grabbing akan dimulai <br> lepaskan tangan dari pointer/mouse, bersantailah!</small>';
        var scroll_counter = 0;
        var interval = setInterval(() => {

            var scroll = document.querySelector(tag.scroll).scrollTop = scroll_counter * 1000;

            scroll_counter++;

            var dom = document.querySelectorAll(tag.contact)

            // public group
            // dom = dom.length > 0 ? dom : document.querySelectorAll('#app > div > div > div._2aMzp > div._10V4p._1mseJ > span > div > span > div > div > div._3xdMj > div:nth-child(5) > div:nth-child(2) > div > div')


            dom.forEach((item, index) => {

                // phone contact
                var contact = item.innerText.split('\n')[0];
               
                
                if (member_numbers == data.length) {
                    ipc.sendToHost('grabb-selesai');
                    document.querySelector(tag.group_info).innerHTML = '<small>selesai!</small>';
                    clearInterval(interval)
                }

                if (!data.includes(contact)) {


                    data.push(contact);



                    if (contact.startsWith('+')) {

                        document.querySelector(tag.group_info).innerHTML = '<small>grabbing ' + data.length + ' orang. lanjutkan!</small>';
                        
                        // dom name
                        var name = item.querySelector(tag.name) ? item.querySelector(tag.name).innerText : '';
                        
                        var user_data = {
                            name: name,
                            phone: contact,
                        };

                        ipc.sendToHost('grabb-result',user_data)
                    }





                }
            })
        }, 1000)
    }


    
})