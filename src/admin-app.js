require("@babel/polyfill");
import Vue from "vue";
import admin from "./components/admin-main.vue";
import admin_header from "./components/admin-header.vue";
import admin_sidebar from "./components/admin-sidebar.vue";
import { CONTENT_MODULE_TYPE } from "./components/content-module-editor.vue";
import { CERTIFICATION_COACH_MODULE_TYPE } from "./components/certification-coach-module-editor.vue";
const axios = require("axios").default;
import { EventBus } from "./eventBus.js";
import { getDefaultAudiences } from "./data/audiencing";

const production = true;
Vue.config.productionTip = production;
Vue.config.devtools = !production;

var app = new Vue({
  el: "#admin-app",
  components: {
    admin,
    admin_header,
    admin_sidebar,
  },
  data: function() {
    return {
      is_ready: false,
      saving_page: false,
      userData: {
        level: null,
        role: null,
      },
      slug: "",
      front_end: false,
      page_sys: {},
      language: "ENG",
      page_data: {
        widgets: [],
        sidebar_widgets: [],
        header_content: {
          image:
            "assets/images/admin-sys/header-banners/GettyImages-544839957_1600_0_72_RGB.jpg",
          content: "<p>Edit please.</p>",
          title: "Page Title",
        },
      },
      default_page: {
        widgets: [],
        sidebar_widgets: [],
        header_content: {
          image:
            "assets/images/admin-sys/header-banners/GettyImages-544839957_1600_0_72_RGB.jpg",
          content: "<p>Edit please.</p>",
          title: "Page Title",
        },
      },
    };
  },
  computed: {
    user: function() {
      let isSuperAdmin = false;
      let canPublish = false;
      let canSave = false;
      if (!this.front_end) {
        const { level, role } = this.userData;
        isSuperAdmin = level === "super-admin";
        canPublish = isSuperAdmin || (role && role.includes("Publish"));
        canSave = isSuperAdmin || (role && role.trim() !== "");
      }
      return {
        ...this.userData,
        isSuperAdmin,
        canPublish,
        canSave,
      };
    },
    api_endpoint: function() {
      var baseUrl = "https://staging.mylearninghpe.com/techpro";
      if (typeof window.api_base_url !== "undefined") {
        baseUrl = window.api_base_url;
      } else if (window.location.hostname === "techpro.hpe.com") {
        baseUrl = "https://techpro.hpe.com";
      }
      return baseUrl + "/GeoPageAdminAPI.asmx";
    },
    pageAudiences: function() {
      const { relationships, membershiplevels } = getDefaultAudiences();
      return {
        relationships: this.page_sys?.relationships || relationships,
        membershiplevels: this.page_sys?.membershiplevels || membershiplevels,
      };
    },
  },
  mounted: function() {
    this.userData.level = window.user_data.user.level; // load global data
    this.slug = window.page_slug;
    if (typeof global_frontend !== "undefined") {
      this.front_end = global_frontend;
    }

    if (this.front_end) {
      // adjust language setting based on front end selection
      let langSelector = document.getElementById("ddlMasterLanguage");
      let dd_language = (langSelector && langSelector.value) || "";
      this.language = dd_language;
      if (this.language == "") {
        this.language = "ENG";
      }
    }

    this.getPageData();

    EventBus.$on("CHANGE_LANGUAGE", (lang) => {
      this.language = lang;
      this.getPageData();
    });

    EventBus.$on("SAVE_PAGE_DATA", () => {
      this.savePageData(false);
    });

    EventBus.$on("PUBLISH_PAGE_DATA", () => {
      this.savePageData(true);
    });
  },
  methods: {
    savePageData: function(publish = false) {
      if (this.front_end) return false;
      const vm = this;

      let issue_found = false;

      let data = {};
      try {
        data.page = this.page_sys;
        data.page.content = this.page_data;
        data.publish = publish.toString(); // or true depending on setting.
      } catch (error) {
        console.log(error);
        this.logInputDataError(this.page_data, "save");

        issue_found = true;
        alert(
          "You attempted to save your page with invalid content. Please check your content and make sure you didn't save any weird characters to the page."
        );
      }

      if (!issue_found) {
        vm.saving_page = true;

        axios({
          method: "POST",
          url: vm.api_endpoint + "/SavePage",
          data: {
            input: data,
          },
          headers: { "content-type": "application/json" },
        })
          .then(function(response) {
            vm.saving_page = false;
            const { result } = response.data.d;
            const success = result && result !== "failed";
            EventBus.$emit(publish ? "PUBLISH" : "SAVE", success);
            vm.getPageData();
          })
          .catch(function(error) {
            vm.saving_page = false;
            EventBus.$emit(publish ? "PUBLISH" : "SAVE", false);
            console.log(error);
          });
      }
    },
    getPageData: function(language_override = null) {
      let vm = this;
      let url_endpoint = vm.api_endpoint + "/GetPage";

      if (this.front_end) {
        url_endpoint = vm.api_endpoint + "/GetPublicPage";
      }
      if (language_override !== null) {
        this.language = language_override;
      }
      EventBus.$emit("SET_LANGAUGE", this.language);
      axios({
        method: "POST",
        url: url_endpoint,
        data: { slug: this.slug, lang: this.language },
      })
        .then(function(response) {
          let page_info = response.data.d;
          vm.page_sys = page_info.page || {};
          if (typeof page_info.page.content !== "undefined") {
            if (!page_info.page.content) {
              if (vm.front_end && vm.language != "ENG") {
                // reload with ENG
                vm.getPageData("ENG");
                return;
              }
              vm.page_data = vm.default_page;
            } else {
              vm.page_data = page_info.page.content;
            }

            // init array of widgets, if needed
            vm.page_data.widgets = vm.page_data.widgets || [];

            // set type, if not present
            // temp: infer Certification Coach type from title if it was saved without a type
            vm.page_data.widgets = vm.page_data.widgets.map(
              ({ type, title, ...rest }) => {
                let inferredType = type;
                if (!inferredType) {
                  if (/^Certification Coach/i.test(title)) {
                    inferredType = CERTIFICATION_COACH_MODULE_TYPE;
                  } else {
                    inferredType = CONTENT_MODULE_TYPE;
                  }
                }
                return {
                  ...rest,
                  title,
                  type: inferredType,
                };
              }
            );

            // convert widgets' content to arrays
            vm.page_data.widgets = vm.page_data.widgets.map((module) => {
              if (module.type !== CONTENT_MODULE_TYPE) return module;
              const { content, ...rest } = module;
              return {
                ...rest,
                content: [].concat(content),
              };
            });

            vm.is_ready = true;
          }

          // store user role
          vm.userData.role = (page_info.user && page_info.user.role) || null;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    logInputDataError: function(input, context = null) {
      console.log("logging input; context: " + (context || "-"));
      axios({
        method: "POST",
        url: this.api_endpoint + "/LogData",
        data: { input: JSON.stringify(input) },
        headers: { "content-type": "application/json" },
      })
        .then(function(response) {
          console.group("Input data logged:");
          if (response.data && response.data.d) {
            const data = response.data.d;
            console.log(data);
          } else {
            console.warn("missing data in response");
            console.log("response:", response);
          }
          console.groupEnd();
        })
        .catch(function(error) {
          console.group("Error logging input data:");
          console.log("request:", error.request);
          console.log("response:", error.response);
          console.log("input:", input);
          console.groupEnd();
        });
    },
    triggerNotification: function() {
      let vm = this;

      axios({
        method: "POST",
        url: vm.api_endpoint + "/TriggerNotification",
        data: { slug: this.slug },
      })
        .then(function(response) {
          console.log(response);
          alert("We have triggered the proper Reviewer.");
        })
        .catch(function(error) {
          console.log(error);
        });
    },
  },
});
