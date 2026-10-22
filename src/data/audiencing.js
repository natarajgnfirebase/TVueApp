const RELATIONSHIP_EMPLOYEE = Object.freeze({ value: 'EMPLOYEE', label: 'HPE Employee' })
const RELATIONSHIP_AFFILIATED = Object.freeze({ value: 'Affiliated', label: 'Channel Partner' })
const RELATIONSHIP_UNAFFILIATED = Object.freeze({ value: 'Unaffiliated', label: 'Customer' })
const RELATIONSHIP_PARTNER = Object.freeze({ value: 'Partner_restricted_training_access', label: 'MAP Partner (Customer+)' })

const MEMBERSHIP_LEVEL_5 = Object.freeze({ value: '5', label: 'Ambassadors' })
const MEMBERSHIP_LEVEL_4 = Object.freeze({ value: '4', label: 'HPE Master ASE with continuous learning, Aruba Certified Expert' })
const MEMBERSHIP_LEVEL_3 = Object.freeze({ value: '3', label: 'HPE ASE with continuous learning, Aruba Certified Professional' })
const MEMBERSHIP_LEVEL_2 = Object.freeze({ value: '2', label: 'HPE PC/ATP with continuous learning, Aruba Certified Associate' })
const MEMBERSHIP_LEVEL_1 = Object.freeze({ value: '1', label: 'Not certified, pure Sales, or Technical missing continuous learning' })

export const relationships = [
  RELATIONSHIP_EMPLOYEE,
  RELATIONSHIP_AFFILIATED,
  RELATIONSHIP_UNAFFILIATED,
  RELATIONSHIP_PARTNER
]

export const membershiplevels = [
  MEMBERSHIP_LEVEL_5,
  MEMBERSHIP_LEVEL_4,
  MEMBERSHIP_LEVEL_3,
  MEMBERSHIP_LEVEL_2,
  MEMBERSHIP_LEVEL_1
]

export const getRelationship = value => relationships.find(rel => rel.value === value)
export const getMembershipLevel = value => membershiplevels.find(level => level.value === value.toString())

export const getDefaultAudiences = () => ({
  relationships: relationships.map(rel => rel.value),
  membershiplevels: membershiplevels.map(level => level.value)
})

export default {
  relationships,
  membershiplevels
}
