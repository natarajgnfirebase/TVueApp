<template>
  <div class="audiencing-controls">
    <span class="audiencing-controls__label">Audience visibility</span>
    <div class="audiencing-controls__error" v-if="!audiencingValid">You must select at least one relationship & membership level.</div>
    <div class="row">
      <fieldset class="col-md-4">
        <legend>Relationships</legend>
        <ul>
          <li v-for="(relationship, index) in allAudiences.relationships" :key="relationship.value">
            <input
              type="checkbox"
              name="relationship"
              :id="`relationship-${index}`"
              :value="relationship.value"
              :disabled="!isRelationshipAvailable(relationship.value)"
              v-model="audiences.relationships"
            >
            <label :for="`relationship-${index}`">
              {{relationship.label}}
              <small v-if="!isRelationshipValid(relationship.value)">
                <template v-if="isSuperAdmin">Visibility impacted due to <a :href="`CMSPageSALanding.aspx?page=${slug}`">page-level controls</a></template>
                <template v-else>Visibility impacted due to page-level controls – contact your administrator</template>
              </small>
            </label>
          </li>
        </ul>
      </fieldset>
      <fieldset class="col-md-8">
        <legend>Membership levels</legend>
        <ul>
          <li v-for="(level, index) in allAudiences.membershiplevels" :key="level.value">
            <input
              type="checkbox"
              name="membership"
              :id="`membership-level-${index}`"
              :value="level.value"
              :disabled="!isMembershipLevelAvailable(level.value)"
              v-model="audiences.membershiplevels"
            >
            <label :for="`membership-level-${index}`">
              {{level.value}} - {{level.label}}
              <small v-if="!isMembershipLevelValid(level.value)">
                <template v-if="isSuperAdmin">Visibility impacted due to <a :href="`CMSPageSALanding.aspx?page=${slug}`">page-level controls</a></template>
                <template v-else>Visibility impacted due to page-level controls – contact your administrator</template>
              </small>
            </label>
          </li>
        </ul>
      </fieldset>
    </div>
  </div>
</template>

<script>
import allAudiences, { getDefaultAudiences } from '../data/audiencing'

export const audiencingControlsProps = {
  pageAudiences: {
    type: Object,
    default: getDefaultAudiences()
  }
}

export const audiencingControlsMethods = {
  isAudienceAvailable(type, value) {
    return this.pageAudiences[type].includes(value)
  },
  isRelationshipAvailable(value) {
    return this.isAudienceAvailable('relationships', value)
  },
  isMembershipLevelAvailable(value) {
    return this.isAudienceAvailable('membershiplevels', value)
  },
  isAudienceValid(type, value) {
    const audiences = this?.editor?.audiences || this.audiences
    const available = this.isAudienceAvailable(type, value)
    if (available) {
      return true
    }
    return !audiences[type].includes(value)
  },
  isRelationshipValid(value) {
    return this.isAudienceValid('relationships', value)
  },
  isMembershipLevelValid(value) {
    return this.isAudienceValid('membershiplevels', value)
  }
}

export default {
  name: 'audiencing-controls',
  props: {
    slug: String,
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    audiences: Object,
    ...audiencingControlsProps
  },
  data() {
    return {
      allAudiences
    }
  },
  methods: {
    ...audiencingControlsMethods
  },
  computed: {
    audiencingValid: function () {
      const { relationships, membershiplevels } = this.audiences
      const validRels = relationships.filter(this.isRelationshipValid)
      const validMLs = membershiplevels.filter(this.isMembershipLevelValid)
      return validRels.length > 0 && validMLs.length > 0
    }
  },
}
</script>
