<template>
  <div>
    <v-toolbar dense flat>

      <v-toolbar-title>IMPOR/EKSPOR KONTAK : {{list.title}}</v-toolbar-title>
    </v-toolbar>
    <v-container>


      <v-tabs background-color="white" color="deep-purple accent-4">
        <v-tab>IMPORT</v-tab>
        <v-tab>EXPORT</v-tab>

        <v-tab-item>

          <v-container>
            <p>Siapkan File CSV dengan format kolom pertama berisi <b>nama</b>, dan kolom kedua berisi <b>no.WA</b></p>
            <v-btn @click="$emit('routeTo',{route : 'list-detail', tab_id : tab.id, params : {id : list.id}})">Kembali
            </v-btn>
            <v-btn class="ml-2" @click="importContact">Pilih File</v-btn>
            <v-alert class="mt-3" v-if="personal_contact_success" type="info">
              {{personal_contact_success}}
            </v-alert>

          </v-container>

        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <v-select v-model="delimiter" label="Pilih Delimiter"
              :items="[{text : '; (titik koma)', value  : ';'},{text : ', (koma)', value  : ','}]"></v-select>
            <v-btn @click="exportFile()">Simpan File</v-btn>
          </v-container>
        </v-tab-item>
      </v-tabs>


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
  import {
    parsePhoneNumberFromString,
    PhoneNumber
  } from 'libphonenumber-js'

  export default {
    props: ['tab'],
    data: () => ({
      contacts: [],
      delimiter: ';',
      contact_obj: {},
      personal_contact_success: '',
      member_numbers: 0,
      message_failed: '',
      new_contacts: 0,
      progress_value: 0,
      receive_contact: 0,
      status: 'ready',
      list: {},
      ip_data: {}
    }),
    mounted() {

      this.list = ipc.sendSync('get-list', this.tab);
      this.contacts = ipc.sendSync('contacts', this.tab);
      if (this.contacts) {
        this.contacts.forEach(item => {
          this.contact_obj[item.wa_phone] = true;
        })
      }

      axios.get('https://extreme-ip-lookup.com/json/').then(response => {
        this.ip_data = response.data;
      })

    },
    methods: {
      exportFile() {

        dialog.showSaveDialog({}).then(result => {
          var filename = result.filePath;
          if (filename === undefined) {
            alert('the user clicked the btn but didn\'t created a file');
            return;
          }

          var content = '';


          this.contacts.forEach(item => {
            content +=
              `${item.name ? item.name : ''}${this.delimiter}${item.phone}${this.delimiter}${item.wa_phone}\n`;
          })

          fs.writeFileSync(filename + '.csv', content, (err) => {
            if (err) {
              alert('an error ocurred with file creation ' + err.message);
              return
            }
          })
        }).catch(err => {
          alert(err)
        })
      },


      saveToDatabase(contacts, name_index, phone_index) {


        contacts.forEach((item, index) => {

          if (item[phone_index]) {
            var phoneNumber = parsePhoneNumberFromString(item[phone_index], {
              defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
            });
            if(phoneNumber)
            {
               if (phoneNumber.isValid()) {

              var data = {
                name: item[name_index],
                phone: phoneNumber.number,
                wa_phone: phoneNumber.countryCallingCode + phoneNumber.nationalNumber
              };
              data.list_id = this.tab.params.id;
              if (!this.contact_obj[data.wa_phone]) {
                ipc.sendSync('add-contact', {
                  id: this.tab.id,
                  data: data
                });
                this.contact_obj[data.wa_phone] = true;
              }


            }
            }

          }

          if (index == contacts.length - 1) {
            this.personal_contact_success = 'Kontak berhasil disimpan'
          }

        })
      },
      importContact() {
        dialog.showOpenDialog({
          properties: ['openFile']
        }).then(async result => {
          var text = await fs.readFileSync(result.filePaths[0], 'utf8')

          var sample = text.substring(0, 50);
          var delimiter_comma = (sample.match(/,/g) || []).length;
          var delimiter_semi_colon = (sample.match(/;/g) || []).length;

          var arr = this.CSVToArray(text, delimiter_comma > delimiter_semi_colon ? ',' : ';');
          if (arr.length > 0) {
            var row_sample = '';
            if (arr.length == 1) {
              row_sample = arr[0][1];
            } else if (arr.length > 1) {
              row_sample = arr[1][1];

            }
    console.log(row_sample)
            const phoneNumber = parsePhoneNumberFromString(row_sample, {
              defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
            })
           if(phoneNumber)
           {
              this.saveToDatabase(arr, 0, 1)
           }else{
             alert('format data tidak pas, kolom 1 berisi nama, kolom 2 nomor handphone')
           }
          }








        }).catch(err => {
          console.log(err)
        })
      },
      CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
          (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
          ),
          "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [
          []
        ];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

          // Get the delimiter that was found.
          var strMatchedDelimiter = arrMatches[1];

          // Check to see if the given delimiter has a length
          // (is not the start of string) and if it matches
          // field delimiter. If id does not, then we know
          // that this delimiter is a row delimiter.
          if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
          ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

          }

          var strMatchedValue;

          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
          if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[2].replace(
              new RegExp("\"\"", "g"),
              "\""
            );

          } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[3];

          }


          // Now that we have our value string, let's add
          // it to the data array.
          arrData[arrData.length - 1].push(strMatchedValue);
        }

        // Return the parsed data.
        return (arrData);
      },
    }
  }
</script>