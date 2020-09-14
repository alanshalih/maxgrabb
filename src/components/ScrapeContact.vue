<template>
    <div>
                  <v-toolbar dense flat>

      <v-toolbar-title>GRABB KONTAK : {{list.title}}</v-toolbar-title>
                      </v-toolbar>
      <v-container>


           <v-tabs
      background-color="white"
      color="deep-purple accent-4"
    >
      <v-tab>WA GROUP</v-tab>
      <v-tab>Personal Contact</v-tab>

      <v-tab-item
      >
      
         <v-container>
               <div v-if="status == 'ready'">
                <p>Pilih Group yang mau diambil kontaknya kemudian klik tombol di bawah ini</p>
                <!-- <p>{{contact_obj.size}}</p> -->
               
            <v-btn v-if="sync_done" class="purple darken-3 white--text" @click="startScrape()">Mulai Grabbing</v-btn>

                 <v-alert v-if="message_failed" class="mt-3" type="error">
      {{message_failed}}
    </v-alert>
           </div>
           <div v-if="status == 'progress' || status == 'done' ">
   
  <v-progress-circular
      :rotate="360"
      :size="130"
      :width="15"
      :value="progress_value"
      color="purple"
    >
      {{receive_contact}} / {{ member_numbers }}
    </v-progress-circular>

  <div v-if="status == 'done'" class="mt-3">  <p><b>Total Anggota Group</b> : {{member_numbers}}</p>
  <p><b>Kontak yang bisa diGrabb</b> : {{receive_contact}}</p>
  <p><b>Kontak Baru</b> : {{new_contacts}}</p>
  <p><b>Total Kontak dalam List</b> :  {{map_contact.size}}</p>
     <v-alert type="info">
      Kontak yang bisa diGrabb adalah kontak yang belum disimpan di Handphone anda. Kontak yang sudah disimpan tidak bisa digrabb. <br><br> Gunakan Personal Contact untuk memasukan Nomor yang sudah disimpan di Handphone Anda. 
    </v-alert>
<v-btn @click="$emit('routeTo',{route : 'list-detail', tab_id : tab.id, params : {id : list.id}})">Kembali</v-btn>
  <v-btn  class="purple darken-3 white--text ml-3" @click="status = 'ready'">Grabbing Lagi</v-btn>
  </div>
           </div>
         </v-container>

      </v-tab-item>
       <v-tab-item
      >
        <v-container fluid>
              <p><b>Kontak Baru</b> : {{new_map_contact.size}}</p>
           <p><b>Total Kontak dalam List</b> :  {{map_contact.size}}</p>
          <p>Pilih Chat yang mau diambil kontaknya kemudian klik tombol di bawah ini</p>
             <v-btn  class="purple darken-3 white--text"  @click="saveContact()">Simpan Kontak</v-btn>
             <v-alert class="mt-3" v-if="personal_contact_success" type="info">
      {{personal_contact_success}}
    </v-alert>
         <v-alert v-if="message_failed" class="mt-3" type="error">
      {{message_failed}}
    </v-alert>
        </v-container>
      </v-tab-item>
    </v-tabs>

         
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
        sync_done : false,
        personal_contact_success : '',
        new_contact : [],
        member_numbers : 0,
        message_failed : '',
        new_contacts : 0,
        progress_interval : 0,
        map_contact : new Map(),
        new_map_contact : new Map(),
        progress_value : 0,
        receive_contact : 0,
        status : 'ready',
        list : {}
    }),
    watch:{
        personal_contact_success(){
           if(this.personal_contact_success){
                setTimeout(()=>{
                this.personal_contact_success = ''
            },3000)
           }
        }
    },
    mounted(){

          const webview = document.getElementById(this.tab.id);
        webview.addEventListener('ipc-message', (event) => {
        if(event.channel == 'grabb-result')
        {   var data = event.args[0];
           
            data.list_id = this.list.id;
            this.receive_contact++;
         
           if(this.map_contact.has(data.wa_phone))
           {

           }else{
             this.map_contact.set(data.wa_phone,data);
             this.new_contacts++;
                this.new_map_contact.set(data.wa_phone,data);
              // ipc.sendSync('add-contact',{id : this.tab.id, data : data});
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

                      this.progress_interval = setInterval(()=>{
               this.progress_value = Math.floor(100*this.receive_contact / this.member_numbers);
          },1000)

        }

        if(event.channel == 'grabb-selesai')
        {
             this.progress_value = 100;
             clearInterval(this.progress_interval)

            this.status = 'done';


        }

         if(event.channel == 'personal-contact')
        {
           

            var data  = (event.args[0])
            data.list_id = this.list.id;
    
            if(this.map_contact.has(data.wa_phone))
           {

           }else{
             this.map_contact.set(data.wa_phone,data);
             this.new_map_contact.set(data.wa_phone,data);
           }
           

            this.personal_contact_success = `Kontak telah disimpan an. ${data.name} dengan nomor ${data.phone}`
         
            this.message_failed = ''


        }

        // Prints "pong"
        })

         this.list = ipc.sendSync('get-list',this.tab);
         this.contacts = ipc.sendSync('contacts',this.tab);
      
         if(this.contacts)
         {
           if(this.contacts.length ==0)
           {
             this.sync_done = true;
           }

     

             this.contacts.forEach((item,index)=>{
                 this.contact_obj[item.wa_phone] = true;
                 this.map_contact.set(item.wa_phone,item);
                 if(this.map_contact.size == this.contacts.length)
                 {
                   this.sync_done  = true;
                 }
             })
         }

    },
    watch:{
      personal_contact_success(){
        if(this.personal_contact_success.length > 0)
        {
          this.syncDataToServer();
        }
      },
      status(){
        if(this.status == 'done')
        {
            this.syncDataToServer();
        }
      }
    },
    methods:{
      syncDataToServer(){
        var counter = 0;
          this.new_map_contact.forEach(item=>{
            counter++;
            ipc.sendSync('add-contact',{id : this.tab.id, data : item});
            if(counter == this.new_map_contact.size)
            {
              ipc.sendSync('update-list',{tab_id : this.tab.id, list_id : this.list.id, total : this.map_contact.size});
            }
          })
      },
        startScrape()
        {
          this.receive_contact = 0;
          this.new_contacts = 0;
          this.new_map_contact = new Map();

            this.status = 'progress';
              const webview = document.getElementById(this.tab.id);
              webview.send('grabb-contact');
        },
        saveContact()
        {     this.new_map_contact = new Map();    
          const webview = document.getElementById(this.tab.id);
               webview.send('save-contact');

        }
    }
}
</script>