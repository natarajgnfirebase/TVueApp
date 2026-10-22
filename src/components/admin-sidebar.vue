<template>
  <div class="admin-app">
    <div class="loading" v-if="is_loading">Loading... Please wait.</div>
    <div class=" main" v-if="!is_loading">
        <div class="row-fluid add-widget" v-if="!preview_mode">
          <div class="col-xs-12 col-sm-12 text-left">
            <a href="#new-sidebar-content" class="btn-add-module sidebar" @click="addSidebarWidget" title="Add A Widget"><img src="assets/images/icons/icon-plus.png" alt="Add" /> Add Sidebar Content</a>
          </div>
          <div class="col-xs-12 col-sm-6 text-right">

          </div>
          <div class="clearfix"></div>
        </div>

        <draggable
          :list="sidebar_widgets"
          :disabled="!enabled"
          class="list-group"
          ghost-class="ghost"
          @start="dragging = true"
          @end="dragging = false"
          handle=".handle"
        >
          <div class="module" v-for="(module, index) in sidebar_widgets" :key="module.title">
            <div class="row" v-if="!front_end && !preview_mode">
              <div class="col-xs-12">
                <div class="module-edit-buttons">
                  <ul class="list-inline text-right">
                    <li><img src="assets/images/icons/icon-vertical-move.png" alt="Move Widget Vertically" class="handle" /></li>
                    <li><img src="assets/images/icons/icon-edit.png" alt="Edit Widget Content" @click="editSidebarWidget(index)" /></li>
                    <li><img src="assets/images/icons/icon-trash.png" alt="Remove Widget" @click="deleteSidebarWidget(index)" /></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="panel image no-icon aquagreen">
                <div class="image" v-if="module.template=='show-image'">
                  <a v-if="!front_end && !preview_mode" href="#" @click.prevent="editSidebarImage(index)" class="edit-image-cta" title="Edit Image"><img src="assets/images/icons/icon-edit-wh.png" alt="Edit Image" style="width: 25px;height: auto;" /></a>
                  <img
                    :src="image_base + module.image"
                    :alt="module.title"
                    :width="imageByFile(module.image).width"
                    :height="imageByFile(module.image).height"
                  />
                </div>
                <div class="header">
                  <h3>{{ module.title }}</h3>
                </div>
                <div class="content" v-html="module.content"></div>
                <div class="footer white" v-if="module.footer_link_title != ''">
                    <a v-bind:href="module.footer_link" v-bind:title="module.title" target="_blank">{{ module.footer_link_title }}</a>
                </div>
            </div>
          </div>
        </draggable>
        <a name="new-sidebar-content"></a>
    </div>

    <div class="modal" id="edit-sidebar-content-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Widget: {{ sidebar_editor.title }}</h3>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">X</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-xs-12 col-sm-12">
                <input type="text" name="title" v-model="sidebar_editor.title" class="title" />
              </div>
            </div>
            <vue-editor id="sidebar-content" v-model="sidebar_editor.content" :editorToolbar="custom_toolbar"></vue-editor>

            <div class="row" style="margin-top: 20px;">
              <div class="col-xs-12 col-sm-12">
                <label for="footer_link_title">Link Title</label>
              </div>
              <div class="col-xs-12 col-sm-12">
                <input type="text" name="footer_link_title" v-model="sidebar_editor.footer_link_title" class="title" />
                <p class="hint">Leave blank to hide.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 col-sm-12">
                <label for="footer_link">Link (include https://)</label>
              </div>
              <div class="col-xs-12 col-sm-12">
                <input type="text" name="footer_link" v-model="sidebar_editor.footer_link" class="title" placeholder="https://" />
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 col-sm-12">
                <label for="image-position">Show Image</label>
              </div>
              <div class="col-xs-12 col-sm-12">
                <select name="image-position" v-model="sidebar_editor.template" class="template">
                  <option value="show-image">Show Image</option>
                  <option value="no-image">No Image</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click.prevent="saveSidebarEditor">Save changes</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- image library -->
    <div class="modal" id="edit-sidebar-image-modal" tabindex="-1" role="dialog" v-if="!front_end">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Image: {{ sidebar_editor.title }}</h3>
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
                        :src="image_base + image.file"
                        :class="{ selected: sidebar_editor.image===image }"
                        alt="Option"
                        @click="selectSidebarImage(image)"
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
import draggable from 'vuedraggable';
import { VueEditor, Quill} from 'vue2-editor';
import QuillTargetedLink from '../utils/quill-links'
import { EventBus } from '../eventBus.js';
import imageSelector from '../mixins/image-selector';
import imageLookup from '../mixins/image-lookup';
import images from '../data/images.json'

Quill.register(QuillTargetedLink)

export default {
  name: 'admin_sidebar',
  order: 0,
  mixins: [imageSelector, imageLookup],
  props: {
    msg: String,
    user: Object,
    sidebar_widgets: Array,
    front_end: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    return {
      is_loading: true,
      sidebar_editor: {},
      show_add_widget: false,
      enabled: true,
      dragging: false,
      preview_mode: false,
      custom_toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link']
      ],
      image_base: 'assets/images/admin-sys/sidebar-widgets/',
      available_images: [...images.sidebar]
    }
  },
  components: {
    draggable,
    VueEditor
  },
  mounted: function() {
    this.is_loading = false;

    if (this.front_end) {
      this.preview_mode = true
    }

    EventBus.$on('PREVIEW_MODE', (preview) => {
      this.preview_mode = preview;
    })
  },
  methods: {
    addSidebarWidget: function (){
      this.sidebar_widgets.push({
        "title": "TITLE",
        "content": "<p>Please enter content by clicking the 'Edit Pencil' icon.</p>",
        "image": this.available_images[0].file,
        "footer_link": "",
        "footer_link_title": "",
        "template": "show-image"
      });
    },
    deleteSidebarWidget: function(index) {
      if(confirm('Are you sure you want to remove this widget?')){
        this.sidebar_widgets.splice(index, 1);
      }
    },
    editSidebarWidget: function(index){
      var widget = this.sidebar_widgets[index];
      this.sidebar_editor = widget;
      $('#edit-sidebar-content-modal').modal();
    },
    editSidebarImage: function(index){
      var widget = this.sidebar_widgets[index];
      this.sidebar_editor = widget;
      $('#edit-sidebar-image-modal').modal();
    },
    selectSidebarImage: function(img){
      this.sidebar_editor.image = img.file;
      $('#edit-sidebar-image-modal').modal('hide');
    },
    saveSidebarEditor: function() {
      $('#edit-sidebar-content-modal').modal('hide');
    }
  }
}
</script>
