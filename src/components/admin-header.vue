<template>
  <div class="admin-app header">
    <div
      class="alert"
      :class="{ 'alert-success': notification.status, 'alert-danger': !notification.status }"
      v-if="notification"
    >
      <p>
        <strong>{{ notification.status ? 'Success' : 'Error'}}:</strong>
        <template v-if="notification.status">The page has been {{ notification.type === 'publish' ? 'published' : 'saved'}}!</template>
        <template v-if="!notification.status">There was an error while {{ notification.type === 'publish' ? 'publishing' : 'saving'}} the page!</template>
      </p>
      <a href="#" @click.prevent="notification=null">Close</a>
    </div>
    <div class="loading" v-if="is_loading">Loading... Please wait.</div>
    <div class="row-fluid main" v-if="!is_loading">
      <div class="col-xs-12 text-right">
        <ul class="list-inline language-selection" v-if="!preview_mode">
          <li>Language Selection:</li>
          <li><a href="#" @click.prevent="loadLanguage('ENG')" v-bind:class="{ 'selected': (main_language=='ENG')}">ENG</a></li>
          <li><a href="#" @click.prevent="loadLanguage('ESN')" v-bind:class="{ 'selected': (main_language=='ESN')}">ESN</a></li>
          <li><a href="#" @click.prevent="loadLanguage('PTB')" v-bind:class="{ 'selected': (main_language=='PTB')}">PTB</a></li>
        </ul>
      </div>
      <div class="col-xs-12">
        <div class="row add-module" v-if="!front_end && !preview_mode">
          <div class="col-xs-12 col-sm-12 text-right">
            <button class="btn btn-primary btn-save-page" v-if="user.canSave" @click.prevent="savePage">Save</button>
            <button class="btn btn-primary btn-save-page" v-if="user.canPublish" @click.prevent="publishPage">Publish</button>
            <button class="btn btn-primary btn-save-page" @click.prevent="previewMode">Preview</button>
            <div class="small" style="margin-top:0.5em;line-height:1.2;">
              Last saved: {{ statusDates.saved }}<br>
              Last published: {{ statusDates.published }}
            </div>
            <div class="small">
              <a href="https://certification-learning.hpe.com/tr/documents/HPE%20Tech%20Pro%20Guide%20to%20DIY%20pages.pdf" target="_blank" class="hpe-arrow-link">DIY User Guide</a>
            </div>
          </div>
        </div>

        <div class="row preview-mode" v-if="!front_end && preview_mode">
          <div class="col-xs-12">
            <div style="display: flex; justify-content: space-between;">
              <fieldset>
                <legend>Preview</legend>
                <ul>
                  <li>
                    <input
                      type="radio"
                      name="preview-mode-type"
                      id="preview-all"
                      v-model="previewAudiences.all"
                      :value="true"
                    >
                    <label for="preview-all">All content</label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="preview-mode-type"
                      id="preview-audienced"
                      v-model="previewAudiences.all"
                      :value="false"
                    >
                    <label for="preview-audienced">As audience:</label>
                    <div class="preview-mode__combos">
                      <select
                        v-model="previewAudiences.relationship"
                        :disabled="previewAudiences.all"
                      >
                        <option disabled :value="''">Relationships</option>
                        <option
                          v-for="relationship in pageAudiences.relationships"
                          :key="relationship"
                          :value="relationship"
                        >
                          {{ getRelationshipLabel(relationship) }}
                        </option>
                      </select>
                      <select 
                        v-model="previewAudiences.membershiplevel"
                        :disabled="previewAudiences.all"
                      >
                        <option disabled :value="''">Membership levels</option>
                        <option
                          v-for="level in pageAudiences.membershiplevels"
                          :key="level"
                          :value="level"
                        >
                          {{ level }} - {{ getMembershipLevelLabel(level) }}
                        </option>
                      </select>
                    </div>
                  </li>
                </ul>
              </fieldset>
              <div class="text-right" style="margin-left: auto;">
                <button class="btn btn-primary btn-save-page" @click.prevent="previewModeEnd">Stop Preview Mode</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <div class="intro" v-bind:style="'background: url('+header_content.image+') no-repeat; background-size: cover;'">
          <div class="content">
            <a v-if="!preview_mode" href="#" @click.prevent="editContent" title="Edit Content" class="edit-content-btn"><img src="assets/images/icons/icon-edit-wh.png" alt="Edit Content" /></a>
            <a name="content"></a>
            <h1 v-html="header_content.title"></h1>
            <div class="content-wrapper" v-html="header_content.content"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- content editor -->
    <div class="modal" id="edit-header-content-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Header Content</h3>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">X</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-xs-12 col-sm-12">
                <input type="text" name="title" v-model="header_content.title" class="title" />
              </div>
            </div>

            <vue-editor id="header-content" v-model="header_content.content" :editorToolbar="custom_toolbar_header"></vue-editor>

            <h4>Background Images</h4>

            <ul class="available-images headers">
              <li v-for="(image, index) in available_images" :key="image">
                <img
                  :src="image.file"
                  :class="{ selected: selected_image==index }"
                  alt="Option"
                  @click="selectImage(image, index)"
                />
              </li>
            </ul>
            <div class="clearfix"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click.prevent="saveEditor">Save changes</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- end content editor -->
  </div>
</template>

<script>
import { VueEditor, Quill } from 'vue2-editor'
import { parse, format, subMinutes } from 'date-fns'
import QuillTargetedLink from '../utils/quill-links'
import { EventBus } from '../eventBus.js'
import images from '../data/images.json'
import { getDefaultAudiences, getRelationship, getMembershipLevel } from '../data/audiencing'

Quill.register(QuillTargetedLink)

export default {
  name: 'admin_header',
  order: 1,
  props: {
    msg: String,
    user: Object,
    header_content: Object,
    lastpublished: String,
    updated: String,
    front_end: {
      type: Boolean,
      default: true
    },
    pageAudiences: {
      type: Object,
      default: getDefaultAudiences()
    }
  },
  data: function() {
    return {
      is_loading: true,
      selected_image: 1,
      error_message: '',
      error: false,
      enabled: true,
      preview_mode: false,
      notification: null,
      main_language: 'ENG',
      custom_toolbar_header: [
        ['bold', 'italic', 'underline'],
        ['link']
      ],
      available_images: [...images.header],
      statusDates: {
        published: null,
        saved: null,
      },
      previewAudiences: {
        all: true,
        relationship: '',
        membershiplevel: ''
      }
    }
  },
  components: {
    VueEditor
  },
  mounted: function() {
    this.is_loading = false;

    this.updateStatusDates()

    if (this.front_end) {
      this.preview_mode = true
    }

    this.updatePreviewAudiences()

    EventBus.$on('SET_LANGAUGE', (lang) => {
      this.main_language = lang;
    })

    EventBus.$on('SAVE', (status) => {
      this.notification = {
        type: 'save',
        status
      }
    });

    EventBus.$on('PUBLISH', (status) => {
      this.notification = {
        type: 'publish',
        status
      }
    });
  },
  updated: function () {
    this.updateStatusDates()
  },
  methods: {
    updateStatusDates: function () {
      this.statusDates.published = this.formatDate(this.lastpublished)
      this.statusDates.saved = this.formatDate(this.updated)
    },
    formatDate: function (date) {
      if (!date) return 'never'
      const parseFmt = 'yyyyMMddHH:mm:ss.SSS'
      const displayFmt = "MMM do, yyyy 'at' h:mm a"
      const tzOffsetMinutes = new Date().getTimezoneOffset()
      const parsedUTC = parse(date, parseFmt, new Date())
      const parsedLocal = subMinutes(parsedUTC, tzOffsetMinutes)
      const display = format(parsedLocal, displayFmt)
      return display
    },
    editContent: function(index){
      $('#edit-header-content-modal').modal();
    },
    selectImage: function(img, index){
      this.header_content.image = img.file;
      this.selected_image = index;
      console.log('Selected')
    },
    saveEditor: function() {
      $('#edit-header-content-modal').modal('hide');
    },
    savePage: function() {
      if (!this.user.canSave) { return; }
      EventBus.$emit('SAVE_PAGE_DATA');
    },
    publishPage: function() {
      if (!this.user.canPublish) { return; }
      if ( confirm('Are you sure you want to publish this page? Click "OK" to continue.') ) {
        EventBus.$emit('PUBLISH_PAGE_DATA');
      }
    },
    triggerNotification: function() {
      this.$emit('triggernotification');
    },
    previewMode: function() {
      this.preview_mode = true
      EventBus.$emit('PREVIEW_MODE', this.previewAudiences)
    },
    previewModeEnd: function() {
      this.preview_mode = false
      EventBus.$emit('PREVIEW_MODE', false)
    },
    loadLanguage: function(language) {
      this.main_language = language
      EventBus.$emit('CHANGE_LANGUAGE', language)
    },
    updatePreviewAudiences: function () {
    // pre-select the first rel/membership levels, if possible
      this.previewAudiences = {
        ...this.previewAudiences,
        ...this.pageAudiences && {
          relationship: this.pageAudiences.relationships[0] || '',
          membershiplevel: this.pageAudiences.membershiplevels[0] || ''
        }
      }
    },
    getRelationshipLabel: value => getRelationship(value).label,
    getMembershipLevelLabel: value => getMembershipLevel(value).label,
  },
  watch: {
    previewAudiences: {
      handler(data, prevData) {
        const mode = this.preview_mode && data
        EventBus.$emit('PREVIEW_MODE', mode)
      },
      deep: true
    },
    pageAudiences: {
      handler() {
        this.updatePreviewAudiences()
      }, 
      deep: true
    }
  }
}
</script>
