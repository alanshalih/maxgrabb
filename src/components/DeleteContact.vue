<template>
  <div>
    <v-toolbar dense flat>

        <v-toolbar-title>HAPUS KONTAK : {{list.title}}</v-toolbar-title>
       
       
    </v-toolbar>
    <v-container>
              
                <v-select v-model="deletion.rule" :items="rule_set"></v-select>
                  <v-checkbox  v-model="deletion.on_list" :label="`Hapus Kontak di List`"></v-checkbox>
                <v-btn v-if="!process && deletion.total > 0" @click="deleteContact()" color="error" class="mt-2 mr-2">PROSES HAPUS</v-btn>
    </v-container>
  </div>
</template>

<script>
  const ipc = require('electron').ipcRenderer;
  import axios from 'axios'
  const {
    dialog
  } = require('electron').remote
  const fs = require('fs');

  export default {
    props: ['tab'],
    data: () => ({
      process : false,
      deletion : {
          rule : 'delete_unread',
          on_list : true,
          on_wa : true,
          contacts : [],
          total : 0,
          deleted : 0
      },
      list: {},
        rule_set: [{
                text: 'Hapus Semua',
                value: 'delete_all'
            }, {
                text: 'Hapus yang belum membaca',
                value: 'delete_unread'
            }, {
                text: 'Hapus yang belum membalas',
                value: 'delete_unreply'
            }],
      ip_data: {}
    }),
    mounted() {

      this.list = ipc.sendSync('get-list', this.tab);
      this.deletion.contacts = JSON.parse(JSON.stringify(ipc.sendSync('contacts', this.tab)));
      this.deletion.total = this.deletion.contacts.length;


          const webview = document.getElementById(this.tab.id);
            webview.addEventListener('ipc-message', (event) => {


                if (event.channel == 'next-delete') {
                    if(event.args[0])
                    {
                      this.deletion.deleted++;
                        if(this.deletion.on_list)
                        {
                          ipc.sendSync('delete-contact',{id : this.tab.id, params : {list_id : this.tab.params.id, wa_phone : event.args[0].wa_phone}})
                        }
                    }
                      this.deleteContact();
             console.log('incoming')
                }
            });
           


    },
    methods: {
      deleteContact()
      {
        console.log('trigger delete')
          const webview = document.getElementById(this.tab.id);
          var contact = this.deletion.contacts.pop();
          if(contact)
          {
            this.process = true;
            if(this.deletion.on_wa)
            {
                webview.send('delete-contact',contact,this.deletion.rule);
            }
          }else{
                
                this.process = false;
            

                this.deletion.contacts = JSON.parse(JSON.stringify(ipc.sendSync('contacts', this.tab)));
                this.deletion.total = this.deletion.contacts.length

               console.log(ipc.sendSync('update-list', {
                  tab_id: this.tab.id,
                  list_id: this.list.id,
                  total: this.deletion.total
                }));
                
          }


      }
    }
  }
</script>