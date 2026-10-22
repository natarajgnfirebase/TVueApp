<template>
  <div class="admin-app">
    <div class="main" v-if="!is_loading">
      <div class="add-module" v-if="!front_end && !preview_mode">
        <div class="dropdown">
          <button class="btn btn-default dropdown-toggle" type="button" id="add-module-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            Add Module
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" aria-labelledby="add-module-menu">
            <li><a href="#new-content" @click="addContentModule">Content Module</a></li>
            <li :class="{ 'disabled': !certificationCoachModulesAllowed }">
              <a href="#new-content" @click="addCertificationCoachModule">
                Certification Coach Module
                <small v-if="!certificationCoachModulesAllowed">max {{ maxCertificationCoachModules }} per page</small>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="modules.length==0 && !front_end">
        <p class="alert alert-info">You currently have no content. Click "Add Module" to start adding!</p>
      </div>

      <draggable
        :list="modules"
        :disabled="!enabled"
        class="list-group"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
        handle=".handle"
      >
        <div v-for="(module, index) in filteredModules" :key="module.title">
          <a name="new-content" v-if="index === filteredModules.length - 1"></a>
          <div
            class="module"
            :class="'module--'+module.type"
            :id="module.id || null"
            :ref="module.id"
            tabindex="0"
          >
            <div class="row" v-if="!front_end && !preview_mode">
              <div class="col-xs-12">
                <div class="module-edit-buttons">
                  <ul class="list-inline text-right">
                    <li><img src="assets/images/icons/icon-vertical-move.png" alt="move module up or down" class="handle" /></li>
                    <li><img src="assets/images/icons/icon-edit.png" alt="edit module" @click="editModule(index)" /></li>
                    <li><img src="assets/images/icons/icon-trash.png" alt="remove module" @click="deleteModule(index)" /></li>
                  </ul>
                </div>
              </div>
            </div>

            <template v-if="module.type === CONTENT_MODULE_TYPE">
              <div class="row page-module-wrapper" :class="[module.template, module.theme]">
                <div class="page-module-inner">
                  <h2 v-if="module.title.trim().length && module.template === 'right'">{{ module.title }}</h2>
                  <div
                    v-if="canDisplayUpperImage(module)"
                    class="image-wrapper"
                    :class="module.template"
                  >
                    <a v-if="!front_end && !preview_mode" href="#" @click.prevent="editImage(index)" class="edit-image-cta" title="Edit Image"><img src="assets/images/icons/icon-edit-wh.png" alt="Edit Image" /></a>
                    <img
                      :src="image_base + module.image"
                      :alt="module.title" class="main"
                      :width="imageByFile(module.image).width"
                      :height="imageByFile(module.image).height"
                    />
                  </div>
                  <h2 v-if="module.title.trim().length && module.template !== 'right'">{{ module.title }}</h2>
                  <div v-if="getContentModuleContent(module).length === 1" class="content" v-html="getContentModuleContent(module)[0]"></div>
                  <div v-else class="row content-row">
                    <div
                      v-for="content in getContentModuleContent(module)"
                      :key="content"
                      :class="`col-md-${12 / getContentModuleContent(module).length}`"
                    >
                      <div class="content" v-html="content"></div>
                    </div>
                  </div>
                  <div v-if="module.template === 'full-bottom'" class="image-wrapper" :class="module.template">
                    <a v-if="!front_end && !preview_mode" href="#" @click.prevent="editImage(index)" class="edit-image-cta" title="Edit Image"><img src="assets/images/icons/icon-edit-wh.png" alt="Edit Image" /></a>
                    <img
                      :src="image_base + module.image"
                      :alt="module.title"
                      class="main"
                      :width="imageByFile(module.image).width"
                      :height="imageByFile(module.image).height"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template v-if="module.type === CERTIFICATION_COACH_MODULE_TYPE">
              <div class="page-module-wrapper">
                <div class="page-module-inner">
                  <h2 v-if="module.title.trim().length">{{ module.title }}</h2>
                  <CertificationCoachModule v-if="front_end" />
                  <template v-else>
                    <p>User-specific recommendations will display here</p>
                  </template>
                </div>
              </div>
            </template>

          </div>
        </div>
      </draggable>
    </div>

    <ContentModuleEditor
      :index="selected_widget_index"
      :widget="contentModuleEditor"
      :slug="slug"
      :page-audiences="pageAudiences"
      :is-super-admin="user.isSuperAdmin"
      @save="saveContentModule"
      @close="closeModule"
      v-if="!front_end"
    />

    <CertificationCoachModuleEditor
      :index="selected_widget_index"
      :widget="certificationCoachModuleEditor"
      :slug="slug"
      :page-audiences="pageAudiences"
      :is-super-admin="user.isSuperAdmin"
      @save="saveCertificationCoachModule"
      @close="closeModule"
      v-if="!front_end"
    />

    <!-- image library -->
    <div class="modal" id="edit-image-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document" v-if="!!contentModuleEditor">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Image: {{ contentModuleEditor.title }}</h3>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">X</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-xs-12 col-sm-12">
                <div>
                  <ul class="available-images">
                    <li v-for="image in current_page_images" :key="image">
                      <img
                        :src="image_base+image.file"
                        :class="{ selected: contentModuleEditor.image===image.file }"
                        alt="Option"
                        @click="selectImage(image)"
                      />
                    </li>
                  </ul>
                </div>
                <div class="clearfix"></div>
                <div class="pagination">
                  <ul class="list-inline">
                    <li v-for="p in total_pages" :key="p" @click="current_page=p">{{p}}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            Click an image to change or <a href="#" data-dismiss="modal">Cancel</a>.
          </div>
        </div>
      </div>
    </div>
    <!-- end image library -->
  </div>
</template>

<script>
import Vue from 'vue';
import draggable from 'vuedraggable';
import { htmlToText } from 'html-to-text'
import ContentModuleEditor, { CONTENT_MODULE_TYPE } from './content-module-editor.vue'
import CertificationCoachModuleEditor, { CERTIFICATION_COACH_MODULE_TYPE } from './certification-coach-module-editor.vue'
import CertificationCoachModule from './certification-coach-module.vue'
import { audiencingControlsProps } from './audiencing-controls.vue'
import { EventBus } from '../eventBus.js';
import imageSelector from '../mixins/image-selector';
import imageLookup from '../mixins/image-lookup';
import images from '../data/images.json'

export default {
  name: 'admin',
  order: 0,
  mixins: [imageSelector, imageLookup],
  props: {
    msg: String,
    user: Object,
    modules: Array,
    front_end: {
      type: Boolean,
      default: true
    },
    slug: String,
    ...audiencingControlsProps
  },
  data: function() {
    return {
      is_loading: true,
      main_language: '',
      publish_success: false,
      save_success: false,
      preview_mode: false,
      selected_widget_index: null,
      selected_widget: {},
      contentModuleEditor: null,
      certificationCoachModuleEditor: null,
      error_message: '',
      error: false,
      show_add_widget: false,
      enabled: true,
      image_base: 'assets/images/admin-sys/content-widgets/',
      dragging: false,
      available_images: [...images.content],
      CONTENT_MODULE_TYPE,
      CERTIFICATION_COACH_MODULE_TYPE,
      maxCertificationCoachModules: 1,
    }
  },
  components: {
    draggable,
    ContentModuleEditor,
    CertificationCoachModuleEditor,
    CertificationCoachModule,
  },
  mounted: function() {
    this.is_loading = false;

    if (this.front_end) {
      this.preview_mode = true
    }

    EventBus.$on('SET_LANGAUGE', (lang) => {
      this.main_language = lang;
    })

    EventBus.$on('PREVIEW_MODE', (preview) => {
      this.preview_mode = preview;
    })
  },
  watch: {
    modules() {
      if (this.front_end) {
        Vue.nextTick(this.deeplink)
      }
    }
  },
  computed: {
    filteredModules() {
      if (this.front_end || !this.preview_mode || this.preview_mode.all) {
        return this.modules
      }
      return this.modules.filter(module => {
        if (!module.audiences) return true
        const {
          relationships: rels,
          membershiplevels: levels
        } = module.audiences
        const { relationship, membershiplevel } = this.preview_mode
        return rels.includes(relationship) && levels.includes(membershiplevel)
      })
    },
    certificationCoachModulesAllowed() {
      const modules = this.modules.filter(module => module.type === CERTIFICATION_COACH_MODULE_TYPE).length
      return modules < this.maxCertificationCoachModules
    }
  },
  methods: {
    deeplink() {
      const { searchParams, hash: fragId } = new URL(document.URL)
      const queryId = searchParams.get('id')
      const ids = [queryId, fragId?.substr(1)].filter(Boolean)

      ids.every((id) => {
        const module = this.$refs[id]?.[0] || document.getElementById(id)
        if (module) {
          module.scrollIntoView({ behavior: 'smooth' })
          module.focus({ preventScroll: true })
          return false
        }
        return true
      })
    },
    isHtmlEmpty(html) {
      return htmlToText(html, {
        wordwrap: false
      }).trim().length === 0
    },
    getContentModuleContent(module) {
      return module.content.filter(html => !this.isHtmlEmpty(html))
    },
    canDisplayUpperImage(module) {
      // full, left and right can be displayed above a single column
      // only full can be displayed over multi-column
      const cols = this.getContentModuleContent(module).length
      const { template } = module
      if (cols > 1) {
        return template === 'full'
      }
      return !template.match(/^(no\-image|full\-bottom)$/)
    },
    addContentModule() {
      const title = `Content Module ${this.modules.length + 1} Title`
      this.modules.push({
        type: CONTENT_MODULE_TYPE,
        title,
        id: false,
        content: ["<p>Please enter content by clicking the 'Edit Pencil' icon.</p>"],
        image: this.available_images[0].file,
        template: "right",
        theme: '',
        footer_link: "",
        footer_link_title: ""
      });
    },
    addCertificationCoachModule() {
      const title = 'Certification Coach'
      this.modules.push({
        type: CERTIFICATION_COACH_MODULE_TYPE,
        title,
      });
    },
    deleteModule(index) {
      if (confirm('Are you sure you want to remove this module?')) {
        this.modules.splice(index, 1);
      }
    },
    editModule(index) {
      const module = this.modules[index];
      this.selected_widget_index = index;

      switch (module.type) {
        case CONTENT_MODULE_TYPE:
          this.contentModuleEditor = module
          break;
        case CERTIFICATION_COACH_MODULE_TYPE:
          this.certificationCoachModuleEditor = module
          break;
      }
      this.selected_widget = module;

      $(`#edit-${module.type}-modal`).modal();
    },
    editImage(index) {
      const module = this.modules[index];
      this.selected_widget = this.contentModuleEditor = module;
      $('#edit-image-modal').modal();
    },
    selectImage(img) {
      this.contentModuleEditor.image = img.file;
      $('#edit-image-modal').modal('hide');
    },
    saveContentModule(data, index) {
      this.$set(this.modules, index, data)
    },
    saveCertificationCoachModule(data, index) {
      this.$set(this.modules, index, data)
    },
    closeModule() {
      this.contentModuleEditor = null
      this.certificationCoachModuleEditor = null
    }
  }
}
</script>
