<template>
    <div>
        <v-toolbar dense flat>

            <v-toolbar-title>CAMPAIGNS</v-toolbar-title>
        </v-toolbar>
        <v-container>
            <v-btn class="purple  white--text" @click="addNewCampaign()">Buat Campaign Baru</v-btn>

            <div style="overflow:auto;max-height:calc(100vh - 210px);">
                <v-list>
                    <v-list-item
                        @click="$emit('routeTo',{tab_id : tab.id, route : 'campaign-detail', params : {id : item.id}})"
                        link v-for="item in campaigns">
                        <v-list-item-content>
                            <v-list-item-title>{{item.title}}</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>

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
        props: ['tab'],
        data: () => ({
            campaigns: [],
        }),
        mounted() {
            this.campaigns = ipc.sendSync('campaigns', this.tab);
        },
        methods: {
            addNewCampaign() {
                this.$emit('routeTo', {
                    tab_id: this.tab.id,
                    route: 'create-campaign',
                    params: {}
                });
            }
        }
    }
</script>