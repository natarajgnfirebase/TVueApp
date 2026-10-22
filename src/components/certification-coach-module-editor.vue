<template>
  <div
    class="modal"
    id="edit-certification-coach-modal"
    tabindex="-1"
    role="dialog"
    data-backdrop="static"
    data-keyboard="false"
    ref="modal"
  >
    <div class="modal-dialog modal-lg" role="document" v-if="editor">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Edit Module: {{ editor.title }}</h3>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">X</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-xs-12">
              This module has no further options.
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
import cloneDeep from 'lodash/cloneDeep'
import AudiencingControls, { audiencingControlsProps, audiencingControlsMethods } from './audiencing-controls.vue'
import generateId from '../mixins/generate-id'
import allAudiences, { getDefaultAudiences } from '../data/audiencing'

export const CERTIFICATION_COACH_MODULE_TYPE = 'certification-coach'

export default {
  name: 'certification-coach-module-editor',
  mixins: [generateId],
  components: {
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
    }
  },
  methods: {
    reset() {
      this.editor = null
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
            audiences: cloneDeep(audiences)
          }
        }
      },
      deep: true
    },
  }
}
</script>
