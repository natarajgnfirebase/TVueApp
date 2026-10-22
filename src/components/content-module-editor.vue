<template>
  <div
    class="modal"
    id="edit-content-modal"
    tabindex="-1"
    role="dialog"
    data-backdrop="static"
    data-keyboard="false"
    ref="modal"
  >
    <div class="modal-dialog modal-lg" role="document" v-if="editor">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Edit Widget: {{ editor.title }}</h3>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">X</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-xs-12">
              <input type="text" name="title" v-model="editor.title" class="title" placeholder="Title" />
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12 col-sm-6">
              <select name="image-position" v-model="editor.template" class="template">
                <option value="left">Image Left Aligned</option>
                <option value="right">Image Right Aligned</option>
                <option value="full">Image Full Width (Top)</option>
                <option value="full-bottom">Image Full Width (Bottom)</option>
                <option value="no-image">No Image</option>
              </select>
            </div>
            <div class="col-xs-12 col-sm-6">
              <select name="theme" v-model="editor.theme" class="theme">
                <option value="">Default theme</option>
                <option value="hpe-medium-purple">HPE Medium Purple</option>
                <option value="hpe-medium-blue">HPE Medium Blue</option>
                <option value="aruba-orange">Aruba Orange</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <div class="slug-editor">
                <input
                  type="text"
                  pattern="[\w\-]"
                  v-model.trim="editor.id"
                  placeholder="Anchor ID"
                  class="slug"
                  @input="onSlugChange" 
                >
                <template v-if="editor.title && editor.title.length">
                  <button type="button" class="btn" @click="createSlug">Refresh</button>
                  <button type="button" class="btn" v-if="editor.id && editor.id.trim().length" @click="copySlug">Copy</button>
                </template>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <label style="font-weight:400;margin:16px 0;">Content: <span v-if="column2">Column 1</span></label>
              <vue-editor
                id="module-content-1"
                v-model="editor.content[0]"
                :editorToolbar="editorToolbar"
                :editorOptions="editorOptions"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-xs-12">
              <label for="widget-multicolumn-toggle-2" style="display:flex;font-weight:400;margin:16px 0;line-height:1.2;">
                <input
                  type="checkbox"
                  v-model="column2"
                  :disabled="column3"
                  :value="true"
                  id="widget-multicolumn-toggle-2"
                  style="margin-right:10px;flex-shrink:0;"
                >
                <span>
                  Display a second column?<br>
                  <small>
                    <ul style="list-style:none;padding:0;margin:0">
                      <li>By selecting this option, left- or right-aligned images <em>will not be displayed</em>.</li>
                      <li>On smaller screens, columns will stack vertically.</li>
                    </ul>
                  </small>
                </span>
              </label>

              <label v-if="column2" style="font-weight:400;margin:0 0 16px;">Content: Column 2</label>
              <vue-editor
                id="module-content-2"
                v-if="column2"
                v-model="editor.content[1]"
                :editorToolbar="editorToolbar"
                :editorOptions="editorOptions"
              />
            </div>
          </div>
          <div class="row" v-if="column2">
            <div class="col-xs-12">
              <label for="widget-multicolumn-toggle-3" style="display:flex;font-weight:400;margin:16px 0;line-height:1.2;">
                <input
                  type="checkbox"
                  v-model="column3"
                  :value="true"
                  id="widget-multicolumn-toggle-3"
                  style="margin-right:10px;flex-shrink:0;"
                >
                <span>
                  Display a third column?<br>
                </span>
              </label>

              <label v-if="column3" style="font-weight:400;margin:0 0 16px;">Content: Column 3</label>
              <vue-editor
                id="module-content-3"
                v-if="column3"
                v-model="editor.content[2]"
                :editorToolbar="editorToolbar"
                :editorOptions="editorOptions"
              />
            </div>
          </div>
          <AudiencingControls
            :slug="slug"
            :isSuperAdmin="isSuperAdmin"
            :audiences="editor.audiences"
            :pageAudiences="pageAudiences"
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click.prevent="save" :disabled="!audiencingValid">Save changes</button>
          <button type="button" class="btn btn-secondary" @click.prevent="close">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueEditor, Quill } from 'vue2-editor'
import cloneDeep from 'lodash/cloneDeep'
import AudiencingControls, { audiencingControlsProps, audiencingControlsMethods } from './audiencing-controls.vue'
import QuillTargetedLink from '../utils/quill-links'
import generateId from '../mixins/generate-id'
import allAudiences, { getDefaultAudiences } from '../data/audiencing'

Quill.register(QuillTargetedLink)

export const CONTENT_MODULE_TYPE = 'content'

export default {
  name: 'content-module-editor',
  mixins: [generateId],
  components: {
    VueEditor,
    AudiencingControls
  },
  props: {
    index: Number,
    slug: String,
    widget: {
      type: Object,
      default: {}
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    ...audiencingControlsProps
  },
  data() {
    return {
      allAudiences,
      editor: null,
      column2: false, // show col-2 editor?
      column3: false, // show col-3 editor?
      idPassed: false, // was an id passed in?
      idEdited: false, // was the id field edited by the user?
      editorToolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link']
      ],
      editorOptions: {
        clipboard: {
          matchVisual: false
        }
      }
    }
  },
  methods: {
    reset() {
      this.editor = null
      this.column2 = false
      this.column3 = false
      this.idPassed = false
      this.idEdited = false
    },
    save() {
      this.$emit('save', this.editor, this.index)
      this.close()
    },
    close() {
      $(this.$refs.modal).modal('hide')
      this.reset()
      this.$emit('close')
    },
    createSlug() {
      if (!this.editor.title) { return }
      this.editor.id = this.generateId(this.editor.title)
    },
    copySlug() {
      navigator.clipboard.writeText(`#${this.editor.id}`)
        .then(() => {})
        .catch((err) => console.warn('writing to clipboard failed', err))
    },
    onSlugChange() {
      this.idEdited = true
      this.editor.id = this.editor.id.replace(/\s/g, '')
    },
    ...audiencingControlsMethods
  },
  computed: {
    audiencingValid: function () {
      const { relationships, membershiplevels } = this.editor.audiences
      const validRels = relationships.filter(this.isRelationshipValid)
      const validMLs = membershiplevels.filter(this.isMembershipLevelValid)
      return validRels.length > 0 && validMLs.length > 0
    }
  },
  watch: {
    widget: {
      handler(newData) {
        if (newData) {
          let audiences = newData.audiences || this.pageAudiences || getDefaultAudiences()
          this.editor = {
            ...newData,
            content: [...newData.content],
            theme: newData.theme || '',
            audiences: cloneDeep(audiences)
          }
          this.column2 = this.editor.content.length > 1
          this.column3 = this.editor.content.length > 2
          this.idPassed = !!this.editor.id
        }
      },
      deep: true
    },
    'editor.title': function () {
      if (!this.editor) return
      if (!this.idPassed && !this.idEdited) {
        this.createSlug()
      }
    },
    column2: function (value) {
      if (!this.editor) return
      if (!value && this.editor.content) {
        this.editor.content.length = 1
      }
    },
    column3: function (value) {
      if (!this.editor) return
      if (!value && this.editor.content) {
        this.editor.content.length = 2
      }
    },
  }
}
</script>
