 <v-tabs-items >
      <v-tab-item >


        <v-toolbar dense>
          <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
          <v-btn @click="item.menu = !item.menu" icon>
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <!-- <v-toolbar-title>{{item.tab}}</v-toolbar-title> -->



          <v-btn text @click="item.menu = true;routeTo({tab_id : item.id, route : 'list'})">
            List
          </v-btn>
          <v-btn text @click="item.menu = true;routeTo({tab_id : item.id, route : 'campaign'})">
            Campaign
          </v-btn>

          <v-spacer></v-spacer>


          <v-menu bottom left>
            <template close-on-click v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="importFile(item,index)">
                <v-list-item-title>Import Database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="exportFile(item)">
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
            <listDetail v-if="item.route == 'list-detail'" @routeTo="routeTo" :tab="item"></listDetail>
            <scrapeContact v-if="item.route == 'grabb-contact'" @routeTo="routeTo" :tab="item"></scrapeContact>
            <Campaigns v-if="item.route == 'campaign'" @routeTo="routeTo" :tab="item"></Campaigns>
            <CampaignCreate v-if="item.route == 'create-campaign'" @routeTo="routeTo" :tab="item"></CampaignCreate>
             <CampaignDetail v-if="item.route == 'campaign-detail'" @routeTo="routeTo" :tab="item"></CampaignDetail>
             <ImportContact v-if="item.route == 'import-contact'" @routeTo="routeTo" :tab="item"></ImportContact>
          </v-col>
          <v-col :cols="item.menu ? 9 : 12">
            <webview  :preload="path" nodeintegration :id="item.id" src="https://web.whatsapp.com"
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0"
              style="display:inline-flex; width:100%; height:calc(100vh - 100px)" :partition="'persist:'+item.uniq_code+'-'+item.id">
            </webview>
          </v-col>
          {{willNavigate(item)}}
        </v-row>
      </v-tab-item>
    </v-tabs-items>