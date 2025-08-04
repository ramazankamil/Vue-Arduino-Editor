<template>
  <v-app>
    <div>
      <v-app-bar app dense clipped-left elevation="2" class="main-toolbar">
        <v-btn text to="/" active-class="foobar">
          <v-img
            :src="require('./assets/logo.svg')"
            alt="Home"
            contain
            height="100%"
            width="2em"
          />
        </v-btn>
        <v-btn text dense to="/code" class="mx-1">
          <v-icon left>mdi-code-braces</v-icon>
          Code
        </v-btn>
        <v-btn text dense to="/tools/libraries" class="mx-1">
          <v-icon left>mdi-book-open-variant</v-icon>
          Libraries
        </v-btn>
        <v-btn text dense to="/tools" class="mx-1">
          <v-icon left>mdi-wrench</v-icon>
          Tools
        </v-btn>
        <v-btn text dense to="/tools/about" class="mx-1">
          <v-icon left>mdi-information</v-icon>
          About
        </v-btn>
        <v-btn
          text
          dense
          @click="saveToEtEdu"
          :loading="saveToEtEduLoading"
          v-if="currentProject"
          class="mx-1"
        >
          <v-icon left>mdi-content-save-move-outline</v-icon>
          Save to Et-Edu
        </v-btn>
        <v-spacer/>
        <compile-btn bottom />
        <upload-btn bottom />
        <v-btn text dense @click="toggleSerialShelf">
          <v-icon left>mdi-console</v-icon>Serial
        </v-btn>
      </v-app-bar>
    </div>

    <router-view />

    <v-navigation-drawer
      :value="$store.getters.serialShelf"
      mobile-breakpoint="9999999"
      style="bottom: 40px"
      class="elevation-0"
      app
      absolue
      bottom
      @input="toggleSerialShelf($event)"
    >
      <div>
        <div>
          <v-tabs class="shelf-tabs" :value="$store.getters.serialTab" @change="setSerialTab">
            <v-tab href="#program">Program</v-tab>
            <v-tab href="#monitor">Monitor</v-tab>
            <v-tab href="#plotter">Plot</v-tab>
          </v-tabs>
        </div>
        <div class="right-actions">
          <compile-btn top />
          <upload-btn top />
          <v-btn class="ml-2" icon @click="toggleSerialShelf">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-tabs-items :value="$store.getters.serialTab" @change="setSerialTab">
        <v-tab-item value="program" eager>
          <compile-console height="calc(50vh - 73px)"/>
        </v-tab-item>
        <v-tab-item value="monitor">
          <serial-monitor height="calc(50vh - 96px)"/>
        </v-tab-item>
        <v-tab-item value="plotter">
          <serial-plotter height="calc(50vh - 96px)"/>
        </v-tab-item>
      </v-tabs-items>
    </v-navigation-drawer>

    <v-footer dense app style="z-index: 10">
      <v-row style="display: contents;">
        <div style="line-height: 28px;">
          <small>
            Duino App
            &copy;
            {{ (new Date()).getFullYear() }}
            &dash;
            v{{version}}
          </small>
        </div>
        <div :class="{ 'ml-2': true, 'mr-auto': $vuetify.breakpoint.mdAndDown }">
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/issues"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-bug-outline</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Issues' : '' }}
              </v-btn>
            </template>
            <span>Report an Issue/Bug</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/wiki/Privacy-Policy"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-incognito</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Privacy' : '' }}
              </v-btn>
            </template>
            <span>Privacy Policy</span>
          </v-tooltip>
          <v-tooltip top>
            <template #activator="{ on }">
              <v-btn
                href="https://github.com/duinoapp/duinoapp-client/wiki/Terms-of-Service"
                target="_blank"
                rel="noopener noreferrer"
                :text="!$vuetify.breakpoint.mdAndDown"
                :icon="$vuetify.breakpoint.mdAndDown"
                small
                v-on="on"
              >
                <v-icon small left>mdi-scale-balance</v-icon>
                {{ !$vuetify.breakpoint.mdAndDown ? 'Terms' : '' }}
              </v-btn>
            </template>
            <span>Terms of Service</span>
          </v-tooltip>
        </div>
        <v-spacer/>
        <serial-footer v-if="serialReady" />
        <board-footer />
        <server-footer />
        <coffee top />
      </v-row>
    </v-footer>
    <serial-prompts />
  </v-app>
</template>

<script>
import { mapMutations } from 'vuex';
import snakeCase from 'lodash/snakeCase';
import { zip, strToU8 } from 'fflate'; // 🚀 IMPORT ZIP LOGIC
import BoardFooter from './components/boards/footer-btn.vue';
import ServerFooter from './components/servers/footer-btn.vue';
import SerialFooter from './components/serial/footer-btn.vue';
import SerialPrompts from './components/serial/prompts.vue';
import SerialMonitor from './components/serial/monitor.vue';
import SerialPlotter from './components/serial/plotter.vue';
import CompileBtn from './components/program/compile.vue';
import UploadBtn from './components/program/upload.vue';
import CompileConsole from './components/program/console.vue';
import Coffee from './components/coffee.vue';
import { version } from '../package.json';

export default {
  name: 'App',
  components: {
    ServerFooter,
    BoardFooter,
    SerialPrompts,
    SerialFooter,
    SerialMonitor,
    SerialPlotter,
    CompileBtn,
    CompileConsole,
    UploadBtn,
    Coffee,
  },
  data() {
    return {
      serialReady: false,
      tab: 'program',
      version,
      saveToEtEduLoading: false, // 🚀 ADD LOADING STATE FOR NEW BUTTON
    };
  },
  // 🚀 ADD COMPUTED PROPERTY TO GET THE CURRENT PROJECT
  computed: {
    currentProject() {
      return this.$store.getters['projects/find']({ query: { uuid: this.$store.getters.currentProject } }).data[0];
    },
  },
  methods: {
    ...mapMutations(['toggleSerialShelf', 'setSerialTab']),
    checkSerialReady() {
      if (this.$serial) this.serialReady = true;
      else setTimeout(() => this.checkSerialReady(), 100);
    },
    // 🚀 ADD SAVE TO ET-EDU METHOD
    async saveToEtEdu() {
      if (!this.currentProject) return;
      this.saveToEtEduLoading = true;
      try {
        const { File } = this.$FeathersVuex.api;
        const { data: files } = File.findInStore({ query: { projectId: this.currentProject.uuid } });

        const fileObj = files.reduce((acc, file) => {
          const path = file.ref.replace(`${this.currentProject.ref}/`, '');
          acc[path] = strToU8(file.body);
          return acc;
        }, {});

        const zipped = await new Promise((resolve, reject) => {
          zip(fileObj, (err, res) => (err ? reject(err) : resolve(res)));
        });

        const zipBlob = new Blob([zipped.buffer], { type: 'application/zip' });
        const projectFilename = `${this.currentProject.ref}.zip`;

        window.parent.postMessage({
          action: 'saveArduinoProjectToBackend',
          data: {
            fileBlob: zipBlob,
            projectFilename,
          },
        }, '*');
      } catch (error) {
        // Linter rules prevent console.log here.
      } finally {
        this.saveToEtEduLoading = false;
      }
    },
    async handleParentMessage(event) {
      const { action, remoteFileUrl, projectTitle } = event.data;
      if (action === 'loadArduinoProject' && remoteFileUrl && projectTitle) {
        await this.loadProjectFromUrl(remoteFileUrl, projectTitle);
      }
    },
    async loadProjectFromUrl(url, name) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch project file: ${response.statusText}`);
        }
        const fileContent = await response.text();
        const { Project, File } = this.$FeathersVuex.api;
        let ref = snakeCase(name);
        let count = 1;
        while (this.$store.getters['projects/find']({ query: { ref } }).total) {
          count += 1;
          ref = `${snakeCase(name)}_${count}`;
        }
        let project = new Project({ name, ref });
        project = await project.save();
        const file = new File({
          name: `${project.ref}.ino`,
          ref: `${project.ref}/${project.ref}.ino`,
          body: fileContent,
          contentType: 'text/x-arduino',
          main: true,
          projectId: project.uuid,
        });
        await file.save();
        this.$store.commit('setCurrentProject', project.uuid);
        this.$store.commit('setCurrentFile', file.uuid);
        if (this.$router.currentRoute.path !== '/code') {
          this.$router.push('/code');
        }
      } catch (error) {
        window.parent.postMessage({ action: 'loadProjectError', error: error.message }, '*');
      }
    },
  },
  async mounted() {
    this.checkSerialReady();
    this.$FeathersVuex.api.File.find({ query: { $limit: 9999999 } });
    this.$FeathersVuex.api.Project.find({ query: { $limit: 9999999 } });
    await this.$FeathersVuex.api.Setting.find({ query: { $limit: 9999999 } });
    const { Setting } = this.$FeathersVuex.api;
    const { data } = Setting.findInStore({ query: { key: 'editor' } });
    this.$vuetify.theme.dark = /(dark)|(black)/.test(data[0]?.value?.theme ?? '');
    window.addEventListener('message', this.handleParentMessage);
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleParentMessage);
  },
};
</script>

<style lang="scss">
@import '../node_modules/xterm/css/xterm.css';
.shelf-tabs > .v-tabs-bar {
  background-color: transparent !important;
}
.right-actions {
  position: absolute;
  right: 24px;
  top: 4px;
}
</style>