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

            <v-btn class="ml-2 purple white--text" @click="importContact()">Pilih File</v-btn>
            <div class="mt-4">

              <v-progress-circular v-if="receive_contact < member_numbers" :rotate="360" :size="130" :width="15"
                :value="progress_value" color="purple">
                {{receive_contact}} / {{ member_numbers }}
              </v-progress-circular>
            </div>
            <v-alert class="mt-3" v-if="personal_contact_success" type="info">
              {{personal_contact_success}}
            </v-alert>

          </v-container>

        </v-tab-item>
        <v-tab-item>
          <v-container fluid>
            <v-select v-model="delimiter" label="Pilih Delimiter"
              :items="[{text : '; (titik koma)', value  : ';'},{text : ', (koma)', value  : ','}]"></v-select>
            <v-btn class="purple white--text" @click="exportFile()">Simpan File</v-btn>
          </v-container>
        </v-tab-item>
      </v-tabs>


    </v-container>
    <v-dialog v-model="dialog" persistent scrollable max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Upload Contact</span>
        </v-card-title>
        <v-card-text>

          <v-alert v-if="error_upload_text" type="error">
            {{error_upload_text}}
          </v-alert>

          <table>
            <tr>
              <th v-for="(header,index) in sample_rows[0]">
                <v-text-field v-model="sample_rows[0][index]"></v-text-field>
              </th>

            </tr>
            <tr>
              <th v-for="(header,index) in sample_rows[0]">
                <v-btn @click="removeColumn(index)" color="error">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </th>
            </tr>
            <tr v-for="(row,index) in sample_rows" v-if="index > 0">
              <td v-for="col in row">{{col}}</td>
            </tr>
          </table>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1" text @click="dialog = false">TUTUP</v-btn>
          <v-btn color="purple white--text darken-1" @click="saveData()">SIMPAN</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
      dialog: false,
      contacts: [],
      delimiter: ';',
      error_upload_text: '',
      contact_obj: {},
      personal_contact_success: '',
      member_numbers: 0,
      message_failed: '',
      new_contacts: 0,
      progress_value: 0,
      receive_contact: 0,
      status: 'ready',
      list: {},
      sample_rows: [],
      full_data: [],
      json_data: [],
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
      removeColumn(index) {
        this.sample_rows.forEach(item => {
          item.splice(index, 1)
        })
        this.full_data.forEach(item => {
          item.splice(index, 1)
        })
      },
      checkHeader(sample, full = false) {
        var header = sample[0];
        var null_array = [];
        var has_header = header.find(item => {
          null_array.push('');
          return item.includes('phone') | item.includes('name');
        })
        if (has_header) {
          return sample;
        } else {
          sample.unshift(null_array)
          return sample;
        }
      },
      removeHeader(sample) {
        var header = sample[0];
        var has_header = header.find(item => {
          return item.includes('phone') | item.includes('name');
        })
        if (has_header) {
          sample.shift();
        }
        return sample;
      },
      saveData() {
        var index = this.sample_rows[0].findIndex((item, index) => {
          return item == "";
        })
        if (index > -1) {
          this.error_upload_text = "Kolom ke-" + (index + 1) + " tidak memiliki atribut"
          return;
        }

        if (this.sample_rows[0].includes('phone')) {
          var header = this.sample_rows[0];
          var data = [];
          this.full_data = this.removeHeader(this.full_data);
          this.member_numbers = this.full_data.length;
          this.new_contacts = 0;
          this.full_data.forEach((item, index) => {

            var obj = {};
            header.forEach((head, idx) => {
              obj[head] = item[idx];
            })
            if (obj.phone)
              data.push(obj);

          })
          this.json_data = data;
          this.processToDatabase();
          this.dialog = false;
        } else {
          this.error_upload_text = "Kolom phone tidak ada"
        }
      },
      processToDatabase() {
        var data = this.json_data.shift();
        this.receive_contact++;;
        this.progress_value = Math.floor(100 * this.receive_contact / this.member_numbers);

        if (data) {
          var phoneNumber = parsePhoneNumberFromString(data.phone, {
            defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
          });

          if (phoneNumber) {
            if (phoneNumber.isValid()) {
              data.wa_phone = phoneNumber.countryCallingCode + phoneNumber.nationalNumber;
              data.list_id = this.tab.params.id;
              if (!this.contact_obj[data.wa_phone]) {
                ipc.sendSync('add-contact', {
                  id: this.tab.id,
                  data: data
                });
                this.contact_obj[data.wa_phone] = true;
                this.new_contacts++;
                setTimeout(() => {
                  this.processToDatabase();
                }, 5)
              } else {
                this.processToDatabase();
              }
            } else {
              this.processToDatabase();
            }
          } else {
            this.processToDatabase();
          }
        } else {
          this.personal_contact_success = this.new_contacts+' Kontak Baru berhasil disimpan'
          this.receive_contact = this.member_numbers;
          this.list.headers = this.sample_rows[0];
          ipc.sendSync('update-list', {
            tab_id: this.tab.id,
            list_id: this.list.id,
            headers : this.list.headers,
            total: Object.keys(this.contact_obj).length
          });
        }


      },
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
        this.member_numbers = contacts.length;
        console.log(phone_index)
        this.processSave(contacts, name_index, phone_index, 0)

      },
      processSave(contacts, name_index, phone_index, index) {
        if (index == contacts.length - 1) {
          this.receive_contact = this.member_numbers;
          this.personal_contact_success = 'Kontak berhasil disimpan'
          ipc.sendSync('update-list', {
            tab_id: this.tab.id,
            list_id: this.list.id,
            total: Object.keys(this.contact_obj).length
          });
          return;
        }
        var item = contacts[index];
        this.receive_contact = index;
        this.progress_value = Math.floor(100 * this.receive_contact / this.member_numbers);
        if (item[phone_index]) {
          var phoneNumber = parsePhoneNumberFromString(item[phone_index], {
            defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
          });
          if (phoneNumber) {
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

                setTimeout(() => {


                  this.processSave(contacts, name_index, phone_index, index + 1)
                }, 50)
              } else {
                setTimeout(() => {
                  this.processSave(contacts, name_index, phone_index, index + 1)
                }, 10)
              }


            } else {
              setTimeout(() => {
                this.processSave(contacts, name_index, phone_index, index + 1)
              }, 10)
            }
          } else {
            setTimeout(() => {
              this.processSave(contacts, name_index, phone_index, index + 1)
            }, 10)
          }

        } else {
          setTimeout(() => {
            this.processSave(contacts, name_index, phone_index, index + 1)
          }, 10)
        }





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
          var sample = (arr.slice(0, 7))
          this.sample_rows = this.checkHeader(sample)
          this.dialog = true;
          this.full_data = JSON.parse(JSON.stringify(arr));
          // if (arr.length > 0) {
          //   var row_sample = '';
          //   if (arr.length == 1) {
          //     row_sample = arr[0][1];
          //   } else if (arr.length > 1) {
          //     row_sample = arr[1][1];

          //   }

          //   const phoneNumber = parsePhoneNumberFromString(row_sample, {
          //     defaultCountry: this.ip_data.countryCode ? this.ip_data.countryCode : 'ID'
          //   })
          //  if(phoneNumber)
          //  {
          //     this.saveToDatabase(arr, 0, 1)
          //  }else{
          //    alert('format data tidak pas, kolom 1 berisi nama, kolom 2 nomor handphone')
          //  }
          // }








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
<style>
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 4px 8px;

  }

  th {
    /* background-color: #dddddd; */
  }
</style>