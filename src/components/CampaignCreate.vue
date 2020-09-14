<template>
  <div>
    <v-toolbar dense flat>

      <v-toolbar-title>CREATE NEW CAMPAIGN</v-toolbar-title>
    </v-toolbar>
    <v-container>
      <div style="overflow-y:auto;overflow-x:hidden;max-height:calc(100vh - 210px);">
        <v-text-field label="Title" v-model="new_data.title"></v-text-field>

        <v-select  item-text="title" v-model="new_data.lists" multiple return-object @change="FetchContact()"
          :items="lists" label="Pilih List">
        </v-select>
        <v-textarea rows="10" label="Pesan" v-model="new_data.message"></v-textarea>
        <v-alert type="info">
          <div>spintax bisa digunakan dengan format {halo | hola | hai}</div>
        </v-alert>
        <v-alert v-if="this.new_data.lists.length > 0" type="info">
          gunakan <span v-for="item in this.new_data.lists[0].headers">[{{item}}] </span> untuk custom tag pada pesan
        </v-alert>
        <div> <label for="">Lampirkan Gambar</label></div>
        <input type="file" @change="uploadImage" id="image" accept="image/x-png,image/gif,image/jpeg">
        <img style="width : 100%" class="mt-3" v-if="image_preview" :src="image_preview" alt="">
      </div>
      <v-btn @click="addNewCampaign()" class="mt-3 purple  white--text">
        <v-icon left>mdi-content-save</v-icon>
        Simpan Campaign
      </v-btn>
    </v-container>
  </div>
</template>
<script>
  const ipc = require('electron').ipcRenderer;
  const shortid = require('shortid');
  export default {
    props: ['tab'],
    data: () => ({
      lists: [],
      buffered: [],
      image_preview: '',
      new_data: {
        counter: 0,
        title: '',
        lists: [],
        contacts: [],
        message: '',
        image: '',

      }
    }),
    mounted() {
      this.lists = ipc.sendSync('lists', this.tab);
      this.new_data.message = this.tab.params.message;
      this.new_data.title = this.tab.params.title;
       this.new_data.image = this.tab.params.image;
       if(this.new_data.image)
       {
         this.image_preview = ipc.sendSync('view-image', this.new_data.image);
       }


    },
    methods: {
      getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.image_preview = reader.result;
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      },
      uploadImage() {
        var input = document.getElementById('image');
        if (input.files[0]) {
          this.getBase64(input.files[0]);
          this.new_data.image = input.files[0].path;
        }

      },
      FetchContact() {
        this.buffered = [];
        this.new_data.lists.forEach(list => {
          var contacts = ipc.sendSync('contacts', {
            id: this.tab.id,
            params: {
              id: list.id
            }
          });
          this.buffered = this.buffered.concat(contacts);
        })


      },
      addNewCampaign() {
        var id = shortid.generate();
        this.new_data.id = id;
        this.new_data.contacts = this.buffered;
        this.new_data.sending_rule = 'send_to_all';
        this.new_data.sending_batch = 100;
        this.new_data.delay_from = 5;
        this.new_data.delay_to = 15;
        this.new_data.sent_listed = {};
        ipc.sendSync('add-campaign', {
          id: this.tab.id,
          data: this.new_data
        });
        this.$emit('routeTo', {
          tab_id: this.tab.id,
          route: 'campaign-detail',
          params: {
            id: this.new_data.id
          }
        });
      }
    }
  }
</script>