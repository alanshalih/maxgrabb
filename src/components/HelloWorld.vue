
    <template>
  <v-card>
    
    <v-tabs
      v-model="tab"
      background-color="primary"
      dark
    >
      <v-tab
        v-for="item in items"
        :key="item.id"
      >
        {{ item.tab }}
      </v-tab>
     <v-btn  @click="addTabs()" icon  class="mt-1 ml-1">
       <v-icon>mdi-plus</v-icon>
     </v-btn>
    </v-tabs>
    

    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="(item,index) in items"
        :key="item.id"
      >
      
      
        <v-toolbar dense>
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
            <v-btn @click="item.menu = !item.menu" icon>
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <!-- <v-toolbar-title>{{item.tab}}</v-toolbar-title> -->



      <v-btn  text @click="item.menu = true;routeTo({tab_id : item.id, route : 'list'})" >
        List
      </v-btn>
      <v-btn text @click="item.menu = true;routeTo({tab_id : item.id, route : 'campaign'})" >
        Campaign
      </v-btn>

      <v-spacer></v-spacer>


        <v-menu bottom left>
            <template close-on-click v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
               <v-list-item >
                <v-list-item-title>Import Database</v-list-item-title>
              </v-list-item>
              <v-list-item >
                <v-list-item-title>Export Database</v-list-item-title>
              </v-list-item>
               <v-list-item @click="openDevTools(item,index)">
                <v-list-item-title>Open DevTools</v-list-item-title>
              </v-list-item>
              <v-list-item @click="close(item,index)">
                <v-list-item-title>Tutup Tab</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
    </v-toolbar>
      <v-row no-gutters>
            <v-col v-if="item.menu" :cols="item.menu ? 3 : 0">
                    

              <list v-if="item.route == 'list'" @routeTo="routeTo" :tab="item"></list>
              <listDetail v-if="item.route == 'list-detail'" @routeTo="routeTo" :tab="item" ></listDetail>
                <scrapeContact v-if="item.route == 'grabb-contact'" @routeTo="routeTo" :tab="item" ></scrapeContact>
    </v-col>
    <v-col :cols="item.menu ? 9 : 12">  
             <webview   :preload="path" nodeintegration :id="item.id"  src="https://web.whatsapp.com" useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36" style="display:inline-flex; width:100%; height:85vh" :partition="'persist:'+item.id"></webview></v-col>
              {{willNavigate(item)}}
      </v-row>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
const ipc = require('electron').ipcRenderer;
const { shell } = require('electron');
import list from './List'
import listDetail from './ListDetail'
import scrapeContact from './ScrapeContact'
const isDev = require('electron-is-dev');
const path = require('path');
     const getSourceDirectory = () => isDev
    ? path.join(process.cwd(), 'dist_electron') // or wherever your local build is compiled
    : __dirname; // asar location

const preload = path.join(getSourceDirectory(), '/preload.js');


  export default {
    data () {
      return {
        tab: null,
        path : preload,
        webview : {},
        items: [
        ],
      }
    },
    components:{
      list,
      listDetail,
      scrapeContact
    },
    mounted(){



        this.items = ipc.sendSync('tabs');

        setTimeout(()=>{
          if(this.items.length > 0)
          this.willNavigate(this.items[0]);
        },3000)



      },
    methods:{
      willNavigate(tab)
      {

        if(!this.webview[tab.id])
        {

          this.webview[tab.id] = document.getElementById(tab.id);
          if(this.webview[tab.id])
          {
            this.webview[tab.id].addEventListener('new-window', async (e) => {
              const protocol = require('url').parse(e.url).protocol
              if (protocol === 'http:' || protocol === 'https:') {
                await shell.openExternal(e.url)
              }
            })
          }

        }
        
      },
      routeTo(data)
      {
        var index_init = -1;
        var tab = this.items.find((item,index)=>{
          if(item.id == data.tab_id){
index_init = index;
              return true;
          }
        
        });

        if(tab)
        {
          
          tab.route = data.route;
          if(data.params)
        tab.params  = data.params;
        }
      },
      addTabs(tab){
        for(var i=1;i<=(this.items.length+1);i++){
            var find = this.items.find(item=>{
              return item.id == 'tab-'+i;
            })
            if(!find)
            {
               var data = { tab: 'Tab '+i, id: 'tab-'+i, menu : false, route : 'list', params : {} };
                this.items.push(data )
                ipc.sendSync('add-tabs',data);
                break;
            }
           
        }
      },
      sendJS(tab){
        const webview = document.getElementById(tab.id);
       webview.executeJavaScript("document.querySelector('#main > footer > div._3ee1T._1LkpH.copyable-area > div:nth-child(3) > button')");


      },
      close(item,index)
      {
        this.items.splice(index,1);
 ipc.sendSync('close-tab',{id : item.id});
      },
      writeText(tab)
      {
          const webview = document.getElementById(tab.id);
          webview.paste();
          console.log('paste')

      },
      openDevTools(tab){
        const webview = document.getElementById(tab.id);
       
        webview.openDevTools();
      }
    }
  }
</script> 