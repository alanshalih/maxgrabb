<template>
    <div>
        <v-toolbar dense flat>

            <v-toolbar-title>CAMPAIGN : {{campaign.title}} </v-toolbar-title>
        </v-toolbar>
        <v-container>



            <v-tabs v-model="menu" background-color="purple " class="elevation-2" dark>
                <v-tabs-slider></v-tabs-slider>

                <v-tab>
                    Pengiriman
                </v-tab>
                <v-tab>
                    Content
                </v-tab>

                <v-tab-item>
                    <v-card flat tile>
                        <v-card-text>
                            <p><b>Pesan yang diproses</b> : {{campaign.counter}}</p>
                            <p><b>Total Kontak</b> : {{campaign.contacts.length}}</p>
                            <v-text-field @change="updateCampaign()" label="Batch Pengiriman" v-model="campaign.sending_batch"></v-text-field>
                            <v-select v-model="campaign.sending_rule" :items="rule_set"></v-select>
                            <v-row>
                                <v-col>
                                    <v-text-field @change="checkMinDelay()" min="5" type="number" label="Min Delay"
                                        v-model="campaign.delay_from"></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-text-field @change="updateCampaign()" label="Max Delay" type="number" v-model="campaign.delay_to">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                     <v-checkbox @change="updateCampaign()" v-model="campaign.unique_code" :label="`Aktifkan Kode Unik`"></v-checkbox>
                                </v-col>
                            </v-row>
                                  <v-alert class="" v-if="!send_status && campaign.image" type="info">
                              <div>  Pengiriman dengan gambar tidak support jika anda berpindah tab saat pengiriman berlangsung.</div>
                                  <!-- <div class="text-right">
                                       <v-btn
      
            outlined
          >
            Temukan Solusi
          </v-btn>
                                     
                                  </div> -->
                            </v-alert>
                            <v-btn v-if="!send_status && campaign.counter < campaign.contacts.length" @click="Kirim()"
                                class="mt-3 purple darken-2 white--text">
                                <v-icon left>mdi-send</v-icon>
                                Kirim
                            </v-btn>
                            <v-btn v-if="send_status" @click="Pause()" class="mt-3">
                                <v-icon left>mdi-pause</v-icon>
                                PAUSE
                            </v-btn>

                            <v-alert class="mt-3" v-if="campaign.counter == campaign.contacts.length" type="success">
                                Pengiriman Selesai.
                            </v-alert>

                            <div style="margin-top : 20px">
                                <v-btn color="error" @click="hapusCampaign()" class="mt-2 mr-2">Hapus Campaign</v-btn>
                                <v-btn @click="reuseCampaign()" color="success" class="white--text mt-2 ">Reuse Campaign</v-btn>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat tile>
                        <v-card-text>
                            <v-text-field @change="updateCampaign()" label="title" v-model="campaign.title"></v-text-field>
                            <v-textarea @change="updateCampaign()" rows="8" label="Message" v-model="campaign.message"
                                hint="Isi pesan yang dikirim"></v-textarea>
                            <div class="text-center">     <div>     <img style="width : 50%" class="mt-3" v-if="campaign.image" :src="imagePreview" alt=""></div>
                       <div>     <label style="cursor:pointer" class="v-btn v-btn--contained theme--light v-size--default purple  white--text" for="image">Ganti Gambar</label></div></div>
                            <input style="display:none" type="file" @change="uploadImage" id="image" accept="image/x-png,image/gif,image/jpeg">
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs>





        </v-container>
    </div>
</template>
<script>
    const ipc = require('electron').ipcRenderer;
    const shortid = require('shortid');
    export default {
        props: ['tab'],
        data: () => ({
            menu : '',
            rule_set: [{
                text: 'Kirim ke Semua',
                value: 'send_to_all'
            }, {
                text: 'Kirim ke Nomor Baru',
                value: 'send_to_no_message'
            }, {
                text: 'Yang Belum membaca',
                value: 'send_to_unread'
            }, {
                text: 'Yang Sudah membaca',
                value: 'send_to_read'
            }, {
                text: 'Sudah Membaca tapi tidak dibalas',
                value: 'send_to_read_but_not_reply'
            }, {
                text: 'Yang sudah membalas',
                value: 'send_to_replied'
            }, {
                text: 'Yang Pernah membalas',
                value: 'send_to_ever_replied'
            }],
            send_status: false,
            imagePreview: '',
            campaign: {
                contacts: []
            },
        }),
        mounted() {
            this.campaign = ipc.sendSync('get-campaign', this.tab);

            if (this.campaign.image) {
                this.imagePreview = ipc.sendSync('view-image', this.campaign.image);
                this.campaign.image_data_url = this.imagePreview;
            }

            const webview = document.getElementById(this.tab.id);
            webview.addEventListener('ipc-message', (event) => {


                if (event.channel == 'send-status') {
                    this.send_status = event.args[0]
                }

                if (event.channel == 'update-campaign') {
                    this.campaign.counter = event.args[0].counter;
                }
            });

            webview.send('send-status');



        },
        methods: {
            uploadImage()
            {
            var input = document.getElementById('image');
                    if (input.files[0]) {
                        this.getBase64(input.files[0]);
                        this.campaign.image = input.files[0].path;
                        this.updateCampaign();
                    }
            },
             getBase64(file) {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                this.imagePreview = reader.result;
                 this.campaign.image_data_url = this.imagePreview;
                };
                reader.onerror = function (error) {
                console.log('Error: ', error);
                };
            },
            updateCampaign()
            {   
                if(!this.send_status)
                {   
                     this.campaign.tab_id = this.tab.id;
                    ipc.sendSync('update-campaign', this.campaign);
                }
                    
            },
            reuseCampaign()
            {
                 this.$emit('routeTo', {
                    tab_id: this.tab.id,
                    route: 'create-campaign',
                    params: this.campaign
                });  
            },
            checkMinDelay() {
                if (this.campaign.delay_from < 5) {
                    this.campaign.delay_from = 5;
                }
                this.updateCampaign();
            },
            hapusCampaign() {
                ipc.sendSync('delete-campaign', this.tab);
                this.$emit('routeTo', {
                    tab_id: this.tab.id,
                    route: 'campaign',
                    params: {}
                });
            },
            Kirim() {
                if (this.campaign.counter < this.campaign.contacts.length) {
                    // ipc.sendSync('get-campaign',this.tab);
                    // if(this.campaign.image)
                    // {
                    //     ipc.sendSync('copy-image',this.campaign.image);
                    // }

                    this.send_status = true;
           



                    const webview = document.getElementById(this.tab.id);
                      this.campaign.tab_id = this.tab.id;
                        webview.send('send-campaign', this.campaign);
                }



            },
            Pause() {
                const webview = document.getElementById(this.tab.id);
                webview.executeJavaScript('window.send = false')
                webview.send('send-status');


            }
        }
    }
</script>