<template>
    <div>
        <div class="v-tabs theme--dark">
            <div role="tablist"
                class="v-item-group theme--dark v-slide-group v-tabs-bar v-tabs-bar--is-mobile white--text primary"
                data-booted="true">
                <div class="v-slide-group__prev v-slide-group__prev--disabled">
                    <!---->
                </div>
                <div class="v-slide-group__wrapper">
                    <div class="v-slide-group__content v-tabs-bar__content">
                        <div class="v-tabs-slider-wrapper" style="height: 2px; left: 0px; width: 90px;">
                            <div class="v-tabs-slider"></div>
                        </div>
                        <div tabindex="0" aria-selected="true" role="tab" class="v-tab v-tab--active"> Tab 1 </div>
                        <div tabindex="0" aria-selected="false" role="tab" class="v-tab"> Tab 2 </div>
                        <div tabindex="0" aria-selected="false" role="tab" class="v-tab"> Tab 3 </div>
                        <div tabindex="0" aria-selected="false" role="tab" class="v-tab"> Tab 4 </div>
                        <div tabindex="0" aria-selected="false" role="tab" class="v-tab"> Tab 5 </div><button
                            type="button"
                            class="mt-1 ml-1 v-btn v-btn--flat v-btn--icon v-btn--round theme--dark v-size--default"><span
                                class="v-btn__content"><i aria-hidden="true"
                                    class="v-icon notranslate mdi mdi-plus theme--dark"></i></span></button>
                    </div>
                </div>
                <div class="v-slide-group__next v-slide-group__next--disabled">
                    <!---->
                </div>
            </div>
        </div>
        <div class="v-window v-item-group theme--light v-tabs-items">
            <div class="v-window__container">
                <div class="v-window-item v-window-item--active">
                    <header class="v-sheet v-sheet--tile theme--light v-toolbar v-toolbar--dense" style="height: 48px;">
                        <div class="v-toolbar__content" style="height: 48px;"><button type="button"
                                class="v-btn v-btn--flat v-btn--icon v-btn--round theme--light v-size--default"><span
                                    class="v-btn__content"><i aria-hidden="true"
                                        class="v-icon notranslate mdi mdi-menu theme--light"></i></span></button><button
                                type="button" class="v-btn v-btn--flat v-btn--text theme--light v-size--default"><span
                                    class="v-btn__content"> List </span></button><button type="button"
                                class="v-btn v-btn--flat v-btn--text theme--light v-size--default"><span
                                    class="v-btn__content"> Campaign </span></button>
                            <div class="spacer"></div>
                            <div class="v-menu">
                                <!---->
                            </div><button type="button"
                                class="v-btn v-btn--flat v-btn--icon v-btn--round theme--light v-size--default"
                                role="button" aria-haspopup="true" aria-expanded="false"><span class="v-btn__content"><i
                                        aria-hidden="true"
                                        class="v-icon notranslate mdi mdi-dots-vertical theme--light"></i></span></button>
                        </div>
                    </header>
                    <div class="row no-gutters">
                        <!---->
                        <div class="col col-12">
                            <webview preload="D:\WEGRABB\wegrabb-desktop\dist_electron\preload.js" nodeintegration=""
                                id="tab-1" src="https://web.whatsapp.com/"
                                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0"
                                partition="persist:undefined-tab-1"
                                style="display: inline-flex; width: 100%; height: calc(100vh - 100px);"></webview>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>