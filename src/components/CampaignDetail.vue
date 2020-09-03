<template>
    <div>
          <v-toolbar dense flat>

      <v-toolbar-title>CAMPAIGN : {{campaign.title}} </v-toolbar-title>
                      </v-toolbar>
        <v-container>
            <p><b>Pesan yang diproses</b> : {{campaign.counter}}</p>
              <p><b>Total Kontak</b> : {{campaign.contacts.length}}</p>
              <v-text-field label="Batch Pengiriman" v-model="campaign.sending_batch"></v-text-field>
              <v-select v-model="campaign.sending_rule" :items="rule_set"></v-select>
              <v-row>
                  <v-col>   <v-text-field min="3" type="number" label="Min Delay" v-model="campaign.delay_from"></v-text-field></v-col>
                    <v-col>   <v-text-field label="Max Delay" type="number" v-model="campaign.delay_to"></v-text-field></v-col>
              </v-row>
            <v-btn v-if="!send_status && campaign.counter < campaign.contacts.length" @click="Kirim()" class="mt-3">
        <v-icon left>mdi-send</v-icon>
      Kirim
      </v-btn>
         <v-btn v-if="send_status" @click="Pause()" class="mt-3">
      <v-icon left>mdi-pause</v-icon>
      PAUSE
      </v-btn>

          <v-alert class="mt-3" v-if="campaign.counter == campaign.contacts.length" type="info">
     Alhamdulillah. Selesai.
    </v-alert>
    
    <div  class="mt-5 pt-5">
        <v-btn color="error" @click="hapusCampaign()" >Hapus Campaign</v-btn>
    </div>

        </v-container>
    </div>
</template>
<script>
const ipc = require('electron').ipcRenderer;
const shortid = require('shortid');
export default {
    props : ['tab'],
    data:()=>({
        rule_set : [{
            text : 'Kirim ke Semua',
            value : 'send_to_all'
        },{
            text : 'Kirim ke Nomor Baru',
            value : 'send_to_no_message'
        },{
            text : 'Yang Belum membaca',
            value : 'send_to_unread'
        },{
            text : 'Yang Sudah membaca',
            value : 'send_to_read'
        },{
            text : 'Sudah Membaca tapi tidak dibalas',
            value : 'send_to_read_but_not_reply'
        },{
            text : 'Yang sudah membalas',
            value : 'send_to_replied'
        },{
            text : 'Yang Pernah membalas',
            value : 'send_to_ever_replied'
        }],
        send_status : false,
        campaign : {
            contacts : []
        },
    }),
    mounted(){
        this.campaign =  ipc.sendSync('get-campaign',this.tab);

            const webview = document.getElementById(this.tab.id);
        webview.addEventListener('ipc-message', (event) => {

           
            if(event.channel == 'send-status'){
               this.send_status = event.args[0]
            } 

             if(event.channel == 'update-campaign'){
               this.campaign.counter = event.args[0].counter;
            } 
        });

          webview.send('send-status');


        
    },
    methods:{
        hapusCampaign()
        {
              ipc.sendSync('delete-campaign',this.tab);
                this.$emit('routeTo',{tab_id : this.tab.id, route : 'campaign', params : {id : this.campaign.id}});
        },
        Kirim()
        {
            if(this.campaign.counter < this.campaign.contacts.length)
            {
                  // ipc.sendSync('get-campaign',this.tab);
            // if(this.campaign.image)
            // {
            //     ipc.sendSync('copy-image',this.campaign.image);
            // }

            this.send_status = true;
            

              const webview = document.getElementById(this.tab.id);
              this.campaign.tab_id = this.tab.id;
              webview.send('send-campaign',this.campaign);
            }
          


        },
        Pause(){
               const webview = document.getElementById(this.tab.id);
              webview.executeJavaScript('window.send = false')
              webview.send('send-status');


        }
    }
}
</script>