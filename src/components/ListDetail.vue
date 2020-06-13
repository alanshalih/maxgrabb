<template>
    <div>
                  <v-toolbar dense flat>

      <v-toolbar-title>{{list.title}} ({{contacts.length}} kontak)</v-toolbar-title>
                      </v-toolbar>
                      
      <v-container>
            <v-btn @click="$emit('routeTo',{tab_id : tab.id, route : 'grabb-contact', params : {id : list.id}})">GRABB KONTAK</v-btn>
      </v-container>

<div style="overflow:auto;max-height:70vh;">
    <v-list>
    <span  v-for="contact in contacts" >
        <v-list-item link >
      <v-list-item-content >
        <v-list-item-title>{{contact.name}}</v-list-item-title>
        <v-list-item-subtitle>{{contact.phone}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    </span>
</v-list>
</div>
    </div>
</template>

<script>
const ipc = require('electron').ipcRenderer;
export default {
    props : ['tab'],
    data:()=>({
        contacts : [],
        list : {}
    }),
    mounted(){

         this.list = ipc.sendSync('get-list',this.tab);
         this.contacts = ipc.sendSync('contacts',this.tab);
          ipc.sendSync('update-list',{tab_id : this.tab.id, list_id : this.list.id, total : this.contacts.length});
    },
    methods:{

    }
}
</script>