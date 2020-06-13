<template>
    <div>
                  <v-toolbar dense flat>

      <v-toolbar-title>GRABB KONTAK : {{list.title}}</v-toolbar-title>
                      </v-toolbar>
      <v-container>
         
           <div v-if="status == 'ready'">
                <p>Panduan GRABBING Kontak WA Group</p>
            <p>1. Pilih Grup WA yang mau kontaknya diambil</p>
            <p>2. Buka Group Info</p>
            <p>3. Klik <b>more</b> hingga semua kontak dari group terbuka</p>
            <p>Setelah melakukan ketiga step di atas, klik tombol di bawah ini</p>
            <v-btn @click="startScrape()">Mulai Grabbing</v-btn>

                 <v-alert v-if="message_failed" class="mt-3" type="error">
      {{message_failed}}
    </v-alert>
           </div>
           <div v-if="status == 'progress' || status == 'done' ">
  <v-progress-circular
      :rotate="360"
      :size="100"
      :width="15"
      :value="progress_value"
      color="teal"
    >
      {{buffered_contact.length}} / {{ member_numbers }}
    </v-progress-circular>
  <div v-if="status == 'done'" class="mt-3">  <p><b>Total Anggota Group</b> : {{member_numbers}}</p>
  <p><b>Kontak yang bisa diGrabb</b> : {{buffered_contact.length}}</p>
  <p><b>Kontak Baru</b> : {{new_contacts}}</p>
     <v-alert type="info">
      Kontak yang bisa diGrabb adalah kontak yang belum disimpan di Handphone anda. Kontak yang sudah disimpan tidak bisa digrabb.
    </v-alert>
<v-btn @click="$emit('routeTo',{route : 'list-detail', tab_id : tab.id, params : {id : list.id}})">Kembali</v-btn>
  </div>
           </div>
      </v-container>
    </div>
</template>

<script>
const ipc = require('electron').ipcRenderer;
export default {
    props : ['tab'],
    data:()=>({
        contacts : [],
        contact_obj : {},
        member_numbers : 0,
        message_failed : '',
        new_contacts : 0,
        progress_value : 0,
        buffered_contact : [],
        status : 'ready',
        list : {}
    }),
    mounted(){

          const webview = document.getElementById(this.tab.id);
        webview.addEventListener('ipc-message', (event) => {
        if(event.channel == 'grabb-result')
        {   var data = event.args[0];
            data.wa_phone = data.phone.replace(/[-+\s]/gm,'');
            data.list_id = this.list.id;
            this.buffered_contact.push(data);
            this.progress_value = Math.floor(100*this.buffered_contact.length / this.member_numbers);
            
          
            if(!this.contact_obj[data.wa_phone])
            {
                ipc.sendSync('add-contact',{id : this.tab.id, data : data});
                 this.new_contacts++;

            }
               
           

        }

        if(event.channel == 'grabb-failed')
        {
            this.status = 'ready';
            this.message_failed = event.args[0];
        }

        if(event.channel == 'member_numbers')
        {
            this.member_numbers = event.args[0];
        }

        if(event.channel == 'grabb-selesai')
        {
             this.progress_value = 100;
            this.status = 'done';


        }
        // Prints "pong"
        })

         this.list = ipc.sendSync('get-list',this.tab);
         this.contacts = ipc.sendSync('contacts',this.tab);
         if(this.contacts)
         {
             this.contacts.forEach(item=>{
                 this.contact_obj[item.wa_phone] = true;
             })
         }

    },
    methods:{
        startScrape()
        {
            this.status = 'progress';
              const webview = document.getElementById(this.tab.id);
              webview.send('grabb-contact');
        }
    }
}
</script>