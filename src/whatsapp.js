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
    send_image_button : "._3y5oW",
    chat_dom : "._2hqOq",
    search_button : '._3e4VU',
    contact_info : '#main > header > div._33QME',
    business_contact : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div:nth-child(6) > div:nth-child(3) > div > div > span > span',
    personal_contact : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div:nth-child(4) > div:nth-child(3) > div > div > span > span',
    personal_contact_name : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div._2Bps4._1mTqm._1pDAt > span > span',
    personal_contact_default_name : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div._2Bps4._1mTqm._1pDAt > div:nth-child(3) > span > span'
};

window.send = false;
console.log(ipc)
ipc.on('send-status',()=>{
    ipc.sendToHost('send-status',window.send)
});
ipc.on('save-contact',()=>{
    var contact_info = document.querySelector(tag.contact_info);
    if(contact_info)
    {
        contact_info.click();
        setTimeout(()=>{
                var name = document.querySelector(tag.personal_contact_default_name) ? 
                document.querySelector(tag.personal_contact_default_name) : 
                document.querySelector(tag.personal_contact_name) 

                if(name)
                {
                    var phone = document.querySelector(tag.personal_contact) ? document.querySelector(tag.personal_contact) : document.querySelector(tag.business_contact);
                    ipc.sendToHost('personal-contact',{
                        name : name.innerText,
                        phone : phone.innerText
                    });
                }else{
                    ipc.sendToHost('grabb-failed','Buka Chat dengan Orang yang mau kita ambil kontaknya');
                }
                
         
        },1000)
    }else{
        ipc.sendToHost('grabb-failed','Buka Chat dengan Orang yang mau kita ambil kontaknya');
    }
    
});

function ScrapeGroup()
{
    document.querySelector(tag.group_info).innerHTML = '<small>grabbing akan dimulai</small>';

    var data = [];
    var counter = 0;
    var have_more = document.querySelector(tag.more_caret);
    if(have_more)
    {
        have_more.click();
    }

    setTimeout(()=>{
        
        var member_numbers = parseInt(document.querySelector(tag.participants_number).innerText.split(' ')[0]);
        
        ipc.sendToHost('member_numbers',member_numbers)

      
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
    },1000)


}

ipc.on('grabb-contact', () => {

    var contact_info = document.querySelector(tag.contact_info);

  
    var id = document.querySelector(tag.group_id)


    if(contact_info)
    {   
      

        if(id)
        {
            ScrapeGroup();
        }
        else{
            contact_info.click();
            setTimeout(()=>{

            
                if(document.querySelector(tag.group_id)){
                    ScrapeGroup();
                }else{
                    ipc.sendToHost('grabb-failed','Buka Group yang mau kita ambil kontaknya');
                }
              
             
                    
            
            },1000)
        }
    }else{
        ipc.sendToHost('grabb-failed','Buka Group yang mau kita ambil kontaknya');
    }


   


    
})


ipc.on('send-message', (e,message) => {
    document.querySelector('#hard_expire_time').innerHTML = `<a href="https://wa.me/${message.phone}?text=${encodeURIComponent(message.message)}"></a>`

    document.querySelector('#hard_expire_time a').click();

    setTimeout(()=>{
        var click_button = document.querySelector(tag.send_button);
        if(click_button)
        {
            click_button.click();
        }
    },2000);

});

ipc.on('send-campaign', (e,campaign) => {

    window.send = true;
    var batch_counter = 0; 
    
    function doCampaign() {
        if (campaign.counter < campaign.contacts.length && window.send && batch_counter < campaign.sending_batch) {
   
            batch_counter++;

            var contact = campaign.contacts[campaign.counter];

            contact.name = contact.name ? contact.name : '';

            var text = spin(campaign.message.split('[name]').join(contact.name));

            if(campaign.sent_listed[contact.wa_phone])
            {
                campaign.counter += 1;
                ipc.sendSync('update-campaign',campaign);
                ipc.sendToHost('update-campaign',campaign)
                doCampaign();
                return;
            }else{
                campaign.sent_listed[contact.wa_phone] = true;
            }



            document.querySelector('#hard_expire_time').innerHTML = `<a href="https://wa.me/${contact.wa_phone}?text=${encodeURIComponent(text)}"></a>`

            document.querySelector('#hard_expire_time a').click();

            

            if(campaign.image)
            {
                setTimeout(()=>{
                    ipc.sendToHost('paste-image',campaign.image);
                },2000)
            }



            var campaignTimeOut = setTimeout(() => {


                campaign.counter += 1;

                // send
                var dom = document.querySelectorAll('.message_out')

                // receive dom
                var chat_dom = document.querySelectorAll(tag.chat_dom)


                var dom_in = document.querySelectorAll('.message-in');


                
                if(campaign.image)
                {
                    var click_button = document.querySelector(tag.send_image_button);
                    
                }else{
                    var click_button = document.querySelector(tag.send_button);

                }

                if(click_button)
                    {
                        if (campaign.sending_rule == 'send_to_all')
                        {
                            click_button.click();
                        }

                        if(campaign.sending_rule == 'send_to_no_message' && dom.length == 0 )
                        {
                            click_button.click();
                        }

                        if(dom.length > 0)
                        if (campaign.sending_rule == 'send_to_unread' && dom[dom.length - 1].innerHTML.includes('Delivered')) {
                            click_button.click();
                        }

                        if(dom.length > 0)
                        if (campaign.sending_rule == 'send_to_read' && dom[dom.length - 1].innerHTML.includes('Read')) {
                            click_button.click();
                        }

                        if(chat_dom.length > 0)
                        if (campaign.sending_rule == 'send_to_read_but_not_reply' && dom[dom.length - 1].innerHTML.includes('Read') && chat_dom[chat_dom.length - 1].classList.contains('message-out')) {
                            click_button.click();
                        }

                        if(chat_dom.length > 0)
                        if (campaign.sending_rule == 'send_to_replied' && chat_dom[chat_dom.length - 1].classList.contains('message-in')) {
                            click_button.click();
                        }

                        if(dom_in.length > 0)
                        if (campaign.sending_rule == 'send_to_ever_replied' && dom_in.length > 0) {
                            click_button.click();
                        }

                        
                        ipc.sendSync('update-campaign',campaign);
                        ipc.sendToHost('update-campaign',campaign)
                    }

                    if(campaign.counter == campaign.contacts.length)
                    {
                        window.send = false;
                        ipc.sendToHost('send-status',window.send);

                    }
                

                     doCampaign();

            }, randomIntFromInterval(campaign.delay_from,campaign.delay_to)  * 1000)

            
        }

    }
    doCampaign();

    
})

var SPINTAX_PATTERN = /\{[^"\r\n\}]*\}/;
var spin = function (spun) {
    var match;
    while (match = spun.match(SPINTAX_PATTERN)) {
        match = match[0];
        var candidates = match.substring(1, match.length - 1).split("|");
        spun = spun.replace(match, candidates[Math.floor(Math.random() * candidates.length)])
    }
    return spun;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

