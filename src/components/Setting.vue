<template>
    <div>
        <v-toolbar dense flat>

            <v-toolbar-title>Setting</v-toolbar-title>
        </v-toolbar>

        <v-container>
            <v-text-field @change="changeTabLabel()" v-model="tab.tab" label="Label"></v-text-field>
            <v-text-field disabled v-model="licence_data.access_code" label="Kode Akses"></v-text-field>
            <v-text-field disabled v-model="tab.id" label="Tab ID"></v-text-field>
            <div class="mb-5">API Status : <strong>{{licence_data.api_enabled ? 'Enabled' : 'Disabled'}}</strong></div>
            <v-divider></v-divider>
            <v-checkbox @change="changeTabLabel()" v-model="tab.warming_up" :label="`Warming Up System`"></v-checkbox>
            <div class="mb-3"><small>Warming Up System adalah fasilitas dari MaxGrabb untuk melatih nomor baru anda supaya tidak
                    dibanned oleh Whatsapp. </small></div>
                    <div class="mb-3" v-if="tab.warming_up"><small >Cara kerja sistem ini adalah saling mengirimi pesan antar nomor yang didaftarkan pada form di bawah ini.</small></div>

            <v-text-field @change="changeTabLabel();changePhone()" v-if="tab.warming_up" label="Masukan No.WA Anda"
                v-model="tab.phone" hint="Masukan Nomor yang mau ditraining disini"></v-text-field>
                  <v-text-field @change="changeTabLabel()" v-if="tab.warming_up" label="Kirim Pesan Training Setiap"
                v-model="tab.training_message_delay" suffix="menit"></v-text-field>
                <v-alert v-model="restart_alert" type="info">Mohon <strong>Restart Aplikasi</strong> setelah anda mengaktifkan Warming Up System</v-alert>
        </v-container>

    </div>
</template>

<script>
    const ipc = require('electron').ipcRenderer;
    import axios from 'axios'
    import {
        parsePhoneNumberFromString,
        PhoneNumber
    } from 'libphonenumber-js'
    export default {
        props: ['tab', 'licence_data'],
        data: () => ({
            contacts: [],
            ip_data: {},
            restart_alert : false,
            delete_dialog: false,
            list: {}
        }),
        mounted() {

            axios.get('https://extreme-ip-lookup.com/json/').then(response => {
                this.ip_data = response.data;
            })
        },
        methods: {
            changePhone(){
                this.$parent.$parent.loadTrainingMessage(this.tab);
            },
            changeTabLabel() {
                if (this.tab.phone) {
                    var phoneNumber = parsePhoneNumberFromString(this.tab.phone, {
                        defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
                    })

                    this.tab.phone = phoneNumber.countryCallingCode + phoneNumber.nationalNumber;
                }
                if(!this.tab.training_message_delay)
                {
                    this.tab.training_message_delay = 15
                }

                if(this.tab.training_message_delay < 5)
                {
                     this.tab.training_message_delay = 5
                }
                console.log(this.tab)
                  ipc.sendSync('update-tab', this.tab);

                axios.post(this.$parent.$parent.endpoint+'/api/maxgrabb/register-phone',this.tab).then(response=>{

                    })
                
              
            }
        }
    }
</script>