<template>
    <div>
                  <v-toolbar dense flat>
<v-toolbar-title>
  {{list.title}} ({{list.total}})
</v-toolbar-title>
                      </v-toolbar>
                      
      <v-container>
         <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        
            <v-btn     v-bind="attrs" v-on="on" class="mr-2 mt-2 purple  white--text" @click="$emit('routeTo',{tab_id : tab.id, route : 'grabb-contact', params : {id : list.id}})"> <v-icon>mdi-account-multiple-plus</v-icon> </v-btn>
           
      </template>
      <span>Grabb Group WhatsApp dan Personal Kontak</span>
    </v-tooltip>
      <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
             <v-btn  v-bind="attrs" v-on="on"   class=" mt-2 mr-2 info" @click="$emit('routeTo',{tab_id : tab.id, route : 'import-contact', params : {id : list.id}})"> <v-icon>mdi-swap-vertical</v-icon>   </v-btn>
            </template>
      <span>Import dan Export Kontak</span>
    </v-tooltip>
      <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
             <v-btn v-bind="attrs" v-on="on"  @click="$emit('routeTo',{tab_id : tab.id, route : 'delete-contact', params : {id : list.id}})"   color="error" class="mr-2 mt-2"  >  <v-icon>mdi-account-multiple-remove</v-icon></v-btn>
            </template>
      <span>Hapus Kontak berdasarkan Kondisi</span>
    </v-tooltip>
      <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on"  @click="delete_dialog = true" color="error" class=" mt-2"  >  <v-icon>mdi-delete</v-icon></v-btn>
      </template>
      <span>Hapus List</span>
    </v-tooltip>
      </v-container>
      <v-container class="mb-0 pb-0">
      <v-text-field @input="doSearch"
            placeholder="Cari Kontak"
            v-model="search"
            outlined
          ></v-text-field>
      </v-container>

<div id="scroll" style="overflow:auto;max-height:calc(100vh - 312px);">
    <v-list>
    <span  v-for="(contact,index) in contacts" >
        <v-list-item link >
      <v-list-item-content >
        <v-list-item-title>{{contact.name}}</v-list-item-title>
        <v-list-item-subtitle>{{contact.phone}}</v-list-item-subtitle>
      </v-list-item-content>
          <v-list-item-action>
          <v-btn icon @click="deleteContact(contact,index)">
            <v-icon color="error">mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
    </v-list-item>
    <v-divider>
        
    </v-divider>
    </span>
</v-list>
</div>

   <v-dialog
      v-model="delete_dialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline">Setuju Hapus List?</v-card-title>

        <v-card-text>
         menghapus list berarti juga anda menghapus semua kontak yang terikat pada list ini
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="delete_dialog = false"
          >
            Batalkan
          </v-btn>

          <v-btn
          
            color="error"
            @click="delete_dialog = false;hapusList()"
          >
            Setuju
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    </div>
</template>

<script>
const ipc = require('electron').ipcRenderer;
var _ = require('lodash');
export default {
    props : ['tab'],
    data:()=>({
        contacts : [],
        search : '',
        doSearch : {},
        delete_dialog : false,
        contact_page : 1,
        list : {}
    }),
    mounted(){
 this.list = ipc.sendSync('get-list',this.tab);

         this.loadData(1)

         this.doSearch = _.debounce(()=>{
              if(this.search)
              {
                this.searchContact();
              }else{
                this.loadData(1);
              }
         }, 500);
  var element = document.querySelector('#scroll')
         element.addEventListener('scroll', (event)=>
{
    var element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight)
    {
      this.tab.page++;
       this.loadData(this.tab.page)
    }
});
         
    },
    methods:{
      loadData(page)
      {
         this.tab.page  = page;
         if(this.tab.page == 1)
         {
             this.contacts = ipc.sendSync('get-contacts',this.tab);
         }else{
              this.contacts = this.contacts.concat(ipc.sendSync('get-contacts',this.tab));
         }
       
      },
      searchContact()
      {
        this.tab.search = this.search;
            this.contacts = ipc.sendSync('search-contacts',this.tab);
      },
        deleteContact(contact,index)
        {
            this.contacts.splice(index,1)
            ipc.sendSync('delete-contact',{id : this.tab.id, params : {list_id : this.tab.params.id, wa_phone : contact.wa_phone}})
        },
        hapusList()
        {
             ipc.sendSync('delete-list',this.tab);
                this.$emit('routeTo',{tab_id : this.tab.id, route : 'list', params : {}});
        }
    }
}
</script>