const ipc = require('electron').ipcRenderer;


var tag = {
    title_of_group: "#main > header > div._33QME > div._2FCjS > div > span",
    group_header_contact_list: "#main > header > div._33QME > div._2ruUq._3xjAz > span",  
    more_caret: "._3X7RF > span",
    participants_number: "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div:nth-child(5) > div._1Gecv > div > div > div._3HPyS._1e77x > span",
    group_id: "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div._2Bps4._1mTqm._1pDAt > div._1005i > span",
    group_info: "._3vTfY",
    scroll: "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div",
    contact: "#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div._1TM40 > div:nth-child(5) ._210SC",
    name: "._1_1Jb > ._3Whw5",
    send_button: "._1U1xa",
    send_image_button: "._3y5oW",
    chat_dom: "._2hqOq",
    search_button: '._3e4VU',
    invalid_number : '._9a59P',
    contact_info: '#main > header > div._33QME',
    business_contact: '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div:nth-child(6) > div:nth-child(3) > div > div > span > span',
    business_contact2 : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div._2Bps4._1mTqm._1pDAt > span > span',
    business_contact3 : '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div:nth-child(7) > div:nth-child(3) > div > div > span > span',
    personal_contact: '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div:nth-child(4) > div:nth-child(3) > div > div > span > span',
    personal_contact_name: '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div._2Bps4._1mTqm._1pDAt > span > span',
    personal_contact_default_name: '#app > div > div > div.YD4Yw > div._1-iDe._14VS3 > span > div > span > div > div > div.Mr-fu > div._2Bps4._1mTqm._1pDAt > div:nth-child(3) > span > span',
    delete_chat : '._3wAoe[title="Delete chat"]',
    confirm_delete_chat : '#app > div > span:nth-child(2) > div > div > div > div > div > div > div._2LPYs > div.S7_rT.FV2Qy'
};

window.send = false;
ipc.on('send-status', () => {
    ipc.sendToHost('send-status', window.send)
});


ipc.on('delete-contact', (e, contact, rule)=>{
    if (document.querySelector('#hard_expire_time')) {
        document.querySelector('#hard_expire_time').innerHTML = `<a href="https://wa.me/${contact.wa_phone}"></a>`

        document.querySelector('#hard_expire_time a').click();

        setTimeout(() => {
            if(rule == 'delete_unreply')
            {
                var message_in = document.querySelector('.message-in')
                if(message_in)
                {
                    ipc.sendToHost('next-delete',false);
                    return;
                }
                
            }

                
            if(rule == 'delete_unread')
            {
                var message_out = document.querySelector('.message-out')
                if(message_out){
                    if(message_out.innerHTML.includes('aria-label=" Read "'))
                    {
                        ipc.sendToHost('next-delete',false);
                        return;
                    }else{
                    }
                }else{
                    ipc.sendToHost('next-delete',false);
                    return;
                }
               
            }
            

            var contact_info = document.querySelector(tag.contact_info);
            if (contact_info) {
                contact_info.click();
                setTimeout(()=>{
                    var delete_chat =  document.querySelector(tag.delete_chat);
                    if(delete_chat)
                    {
                        delete_chat.click();
                        setTimeout(()=>{
                            document.querySelector(tag.confirm_delete_chat).click();
                            ipc.sendToHost('next-delete',contact);
                        },500)
                    }else{
                        
                    }
                },1000)
            }else {
                console.log(contact_info)
                ipc.sendToHost('next-delete',false);
            }

        }, 1000);
    }else{
        console.log('expired time not found')
    }
})

ipc.on('save-contact', () => {
    var contact_info = document.querySelector(tag.contact_info);
    if (contact_info) {
        contact_info.click();
        setTimeout(() => {
            var name = document.querySelector(tag.personal_contact_default_name) ?
                document.querySelector(tag.personal_contact_default_name) :
                document.querySelector(tag.personal_contact_name)

            if (name) {
                var phone = document.querySelector(tag.personal_contact) ? document.querySelector(tag.personal_contact) : document.querySelector(tag.business_contact);
                if(!phone)
                {
                    phone = document.querySelector(tag.business_contact2);
                }
                if(phone.innerText.slice(0,1) != '+')
                {
                    phone = ducument.querySelector(tag.business_contact3)
                }
                ipc.sendToHost('personal-contact', {
                    name: name.innerText,
                    phone: phone.innerText,
                    wa_phone : phone.innerText.replace(/[-+\s]/gm,'')
                });
            } else {
                ipc.sendToHost('grabb-failed', 'Buka Chat dengan Orang yang mau kita ambil kontaknya');
            }


        }, 1000)
    } else {
        ipc.sendToHost('grabb-failed', 'Buka Chat dengan Orang yang mau kita ambil kontaknya');
    }

});

function ScrapeGroup() {
    document.querySelector(tag.group_info).innerHTML = '<small>grabbing akan dimulai</small>';

    var data = [];
    var counter = 0;
    var have_more = document.querySelector(tag.more_caret);
    if (have_more) {
        have_more.click();
    }

    setTimeout(() => {

        var member_numbers = parseInt(document.querySelector(tag.participants_number).innerText.split(' ')[0]);

        ipc.sendToHost('member_numbers', member_numbers)


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
                            wa_phone : contact.replace(/[-+\s]/gm,'')   
                        };


                        ipc.sendToHost('grabb-result', user_data)
                        
                    }





                }
            })
        }, 1000)
    }, 1000)


}

ipc.on('grabb-contact', () => {

    var contact_info = document.querySelector(tag.contact_info);


    var id = document.querySelector(tag.group_id)
    


    if (contact_info) {


        if (id) {
            ScrapeGroup();
        } else {
            contact_info.click();
            setTimeout(() => {


                if (document.querySelector(tag.group_id)) {
                    ScrapeGroup();
                } else {
                    ipc.sendToHost('grabb-failed', 'Buka Group yang mau kita ambil kontaknya');
                }




            }, 1000)
        }
    } else {
        ipc.sendToHost('grabb-failed', 'Buka Group yang mau kita ambil kontaknya');
    }






})


ipc.on('send-message', (e, message) => {
    if(document.querySelector(".two"))
    {
        if (document.querySelector('#hard_expire_time')) {
            document.querySelector('#hard_expire_time').innerHTML = `<a href="https://wa.me/${message.phone}?text=${encodeURIComponent(message.message)}"></a>`
    
            document.querySelector('#hard_expire_time a').click();
    
            setTimeout(() => {
                var click_button = document.querySelector(tag.send_button);
                if (click_button) {
                    click_button.click();
                }else{
                    if(message.warming_up)
                    {
                        ipc.sendToHost('number-not-found', message);
                    }else{
                        DeleteInvalidContact(message.tab_id,message.phone);
                    }
                    
                }
    
            }, 2000);
        }
    }else{
        ipc.sendToHost('wa-not-found', message);
    }
    
});


function changeTag(contact,campaign){
    var unicode = '';
    if(campaign.unique_code)
    {
        unicode = '\n\n'+rand_str_without_O0();
    }

    if(campaign.lists[0].headers)
    {
        var text = campaign.message;
        campaign.lists[0].headers.forEach(tag=>{
            if(contact[tag])
            {
                text = text.split('['+tag+']').join(contact[tag])
            }else{
                text = text.split('['+tag+']').join('')
            }
        })
        
        return text+unicode;
    }else{
        return campaign.message.split('[name]').join(contact.name)+unicode;
    }
}

ipc.on('send-campaign', (e, campaign) => {

    window.send = true;
    var batch_counter = 0;

    function doCampaign() {
        if (campaign.counter < campaign.contacts.length && window.send && batch_counter < campaign.sending_batch) {

            batch_counter++;

            var contact = campaign.contacts[campaign.counter];

            contact.name = contact.name ? contact.name : '';

            var text = spin(changeTag(contact,campaign));

            if (campaign.sent_listed[contact.wa_phone]) {
                campaign.counter += 1;
                ipc.sendSync('update-campaign', campaign);
                ipc.sendToHost('update-campaign', campaign)
                doCampaign();
                return;
            } else {
                campaign.sent_listed[contact.wa_phone] = true;
            }



            document.querySelector('#hard_expire_time').innerHTML = `<a href="https://wa.me/${contact.wa_phone}?text=${encodeURIComponent(text)}"></a>`

            document.querySelector('#hard_expire_time a').click();



            if (campaign.image) {
                if (text.length < 1024) {
                    setTimeout(() => {

                        ipc.sendToHost('paste-image', campaign);

                        setTimeout(()=>{
                            var click_button = document.querySelector(tag.send_image_button);

                            if(!click_button)
                            {
                                click_button = document.querySelector(tag.send_button);
                            }
                            
                            if(click_button)
                            {
                                SendChat(click_button,campaign);
                            }else{
                                DeleteInvalidContact(campaign.tab_id,contact.wa_phone);
                            }
                        },3000)

                    }, 1000)

                 

                }else{

                    setTimeout(() => {
                        
                        var click_button = document.querySelector(tag.send_button);
    
                        if(click_button)
                        {
                            SendChat(click_button,campaign);
                        }else{
                            DeleteInvalidContact(campaign.tab_id,contact.wa_phone);
                        }
    
                        ipc.sendToHost('paste-image',campaign);
                        
    
                        setTimeout(()=>{
                            var click_button = document.querySelector(tag.send_image_button);
    
                            if(!click_button)
                            {
                                click_button = document.querySelector(tag.send_button);
                            }
                            
                            if(click_button)
                            {
                                SendChat(click_button,campaign);
                            }else{
                                DeleteInvalidContact(campaign.tab_id,contact.wa_phone);
                            }
                        },3000)

                        
    
                    }, 1000)
                    
                }
            

            } else {

                setTimeout(() => {

                 

                    // process kirim pesan

                    var click_button = document.querySelector(tag.send_button);

                    if(click_button)
                    {
                        SendChat(click_button,campaign);
                    }else{
                        DeleteInvalidContact(campaign.tab_id,contact.wa_phone);
                    }

                }, 2000)

            }






            var campaignTimeOut = setTimeout(() => {


                campaign.counter += 1;

                ipc.sendSync('update-campaign', campaign);
                ipc.sendToHost('update-campaign', campaign)

                if (campaign.counter == campaign.contacts.length) {
                    window.send = false;
                    ipc.sendToHost('send-status', window.send);

                }


                doCampaign();

            }, randomIntFromInterval(campaign.delay_from, campaign.delay_to) * 1000)


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

function SendChat(click_button,campaign)
{


    var dom = document.querySelectorAll('.message_out')

    // receive dom
    var chat_dom = document.querySelectorAll(tag.chat_dom)


    var dom_in = document.querySelectorAll('.message-in');

    
   

    if (click_button) {
        if (campaign.sending_rule == 'send_to_all') {
            click_button.click();
        }

        if (campaign.sending_rule == 'send_to_no_message' && dom.length == 0) {
            click_button.click();
        }

        if (dom.length > 0)
            if (campaign.sending_rule == 'send_to_unread' && dom[dom.length - 1].innerHTML.includes('aria-label=" Delivered "')) {
                click_button.click();
            }

        if (dom.length > 0)
            if (campaign.sending_rule == 'send_to_read' && dom[dom.length - 1].innerHTML.includes('aria-label=" Read "')) {
                click_button.click();
            }

        if (chat_dom.length > 0)
            if (campaign.sending_rule == 'send_to_read_but_not_reply' && dom[dom.length - 1].innerHTML.includes('aria-label=" Read "') && chat_dom[chat_dom.length - 1].classList.contains('message-out')) {
                click_button.click();
            }

        if (chat_dom.length > 0)
            if (campaign.sending_rule == 'send_to_replied' && chat_dom[chat_dom.length - 1].classList.contains('message-in')) {
                click_button.click();
            }

        if (dom_in.length > 0)
            if (campaign.sending_rule == 'send_to_ever_replied' && dom_in.length > 0) {
                click_button.click();
            }
    
    }

  

}
function DeleteInvalidContact(tab_id,wa_phone)
{
    var invalid = document.querySelector(tag.invalid_number);

    if(invalid)
    {
        ipc.sendSync('force-delete-contact',{id : tab_id, wa_phone : wa_phone})
    }
}



function rand_str_without_O0() {
    const list = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    var res = "";
    for(var i = 0; i < 5; i++) {
        var rnd = Math.floor(Math.random() * list.length);
        res = res + list.charAt(rnd);
    }
    return res;
}