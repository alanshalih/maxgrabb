<template>
    <div>
          <v-toolbar dense flat>

      <v-toolbar-title>LIST KONTAK</v-toolbar-title>
                      </v-toolbar>
        <v-container>
             <v-text-field
            v-model="new_list"
            append-icon="mdi-plus"
            name="input-10-1"
            label="Tambah List Baru"
            hint="cth : Keluarga"
            counter
            @keydown.enter="addnewList()"
            @click:append="addnewList()"
          ></v-text-field>

       <div style="overflow:auto;max-height:calc(100vh - 230px);">
       <v-list >
             <v-list-item @click="$emit('routeTo',{tab_id : tab.id, route : 'list-detail', params : {id : item.id}})" link v-for="item in lists">
      <v-list-item-content>
        <v-list-item-title>{{item.title}}</v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        {{item.total ? item.total : 0}}
      </v-list-item-action>
    </v-list-item>
       </v-list>
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
        lists : [],
        new_list : '',

    }),
    mounted(){
        this.lists = ipc.sendSync('lists',this.tab);
    },
    methods:{
        addnewList()
        {
          if(this.new_list)
          {
                var id = shortid.generate();
            var data = {title : this.new_list, id : id, headers : ["name","phone"]};
            this.lists.push(data)
            this.new_list = ''; 
            ipc.sendSync('add-list',{id : this.tab.id, data : data});
            this.$emit('routeTo',{tab_id : this.tab.id, route : 'list-detail', params : {id : data.id}});
          }
        }
    }
}
</script>