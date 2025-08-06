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

<!-- <script>
import { mapMutations } from 'vuex';
import snakeCase from 'lodash/snakeCase';
// 🚀 CHANGE: We no longer need strFromU8, only unzip.
import { zip, strToU8, unzip } from 'fflate';
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
      saveToEtEduLoading: false,
    };
  },
  computed: {
    currentProject() {
      return this.$store.getters['projects/find']({ query: { uuid: this.$store.getters.currentProject } }).data[0];
    },
  },
  methods: {
    // ... (other methods like saveToEtEdu, checkSerialReady, etc. are unchanged)
    ...mapMutations(['toggleSerialShelf', 'setSerialTab']),
    checkSerialReady() {
      if (this.$serial) this.serialReady = true;
      else setTimeout(() => this.checkSerialReady(), 100);
    },
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

      if (action === 'resetEditor') {
        this.resetEditorState();
      }
    },
    resetEditorState() {
      localStorage.clear();
      this.$store.commit('setCurrentProject', null);
      this.$store.commit('setCurrentFile', null);
      if (this.$router.currentRoute.path !== '/code') {
        this.$router.push('/code');
      }
    },
    async loadProjectFromUrl(url, name) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch project file: ${response.statusText}`);
        }
        const zipArrayBuffer = await response.arrayBuffer();
        const zipData = new Uint8Array(zipArrayBuffer);

        const unzipped = await new Promise((resolve, reject) => {
          unzip(zipData, (err, res) => (err ? reject(err) : resolve(res)));
        });

        const { Project, File } = this.$FeathersVuex.api;
        let ref = snakeCase(name);
        let count = 1;
        while (this.$store.getters['projects/find']({ query: { ref } }).total) {
          count += 1;
          ref = `${snakeCase(name)}_${count}`;
        }
        let project = new Project({ name, ref });
        project = await project.save();

        let mainFileUUID = null;

        // 🚀 START CHANGE: Use TextDecoder for Turkish character support
        const decoder = new TextDecoder('windows-1254');
        // 🚀 END CHANGE

        const fileCreationPromises = Object.keys(unzipped).map(async (filePath) => {
          // 🚀 START CHANGE: Decode the file content using the specified decoder
          const fileContent = decoder.decode(unzipped[filePath]);
          // 🚀 END CHANGE
          const isMain = filePath.endsWith('.ino');

          const file = new File({
            name: filePath,
            ref: `${project.ref}/${filePath}`,
            body: fileContent,
            contentType: 'text/x-arduino',
            main: isMain,
            projectId: project.uuid,
          });
          await file.save();

          if (isMain) {
            mainFileUUID = file.uuid;
          }
        });

        await Promise.all(fileCreationPromises);

        this.$store.commit('setCurrentProject', project.uuid);
        if (mainFileUUID) {
          this.$store.commit('setCurrentFile', mainFileUUID);
        }

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
</script> -->

<script>
import { mapMutations } from 'vuex';
import snakeCase from 'lodash/snakeCase';
import { zip, strToU8, unzip } from 'fflate';
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
      saveToEtEduLoading: false,
    };
  },
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

      if (action === 'resetEditor') {
        this.resetEditorState();
      }
    },
    resetEditorState() {
      localStorage.clear();
      this.$store.commit('setCurrentProject', null);
      this.$store.commit('setCurrentFile', null);
      if (this.$router.currentRoute.path !== '/code') {
        this.$router.push('/code');
      }
    },
    async loadProjectFromUrl(url, name) {
      try {
        const { Project, File } = this.$FeathersVuex.api;

        // 🚀 START CHANGE #1: Refactor the loop to satisfy the linter rules
        const { data: existingProjects } = await Project.find({ query: { $limit: 9999 } });
        // Create an array of promises for all deletion tasks
        const deletionPromises = existingProjects.map(async (proj) => {
          await File.remove(null, { query: { projectId: proj.uuid } });
          await proj.remove();
        });
        // Wait for all deletions to complete
        await Promise.all(deletionPromises);
        // 🚀 END CHANGE #1

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch project file: ${response.statusText}`);
        }
        const zipArrayBuffer = await response.arrayBuffer();
        const zipData = new Uint8Array(zipArrayBuffer);

        const unzipped = await new Promise((resolve, reject) => {
          unzip(zipData, (err, res) => (err ? reject(err) : resolve(res)));
        });

        // 🚀 START CHANGE #2: Changed 'let' to 'const' to satisfy the linter
        const ref = snakeCase(name);
        // 🚀 END CHANGE #2
        let project = new Project({ name, ref });
        project = await project.save();

        let mainFileUUID = null;
        const decoder = new TextDecoder('windows-1254');

        const fileCreationPromises = Object.keys(unzipped).map(async (filePath) => {
          const fileContent = decoder.decode(unzipped[filePath]);
          const isMain = filePath.endsWith('.ino');

          const file = new File({
            name: filePath,
            ref: `${project.ref}/${filePath}`,
            body: fileContent,
            contentType: 'text/x-arduino',
            main: isMain,
            projectId: project.uuid,
          });
          await file.save();

          if (isMain) {
            mainFileUUID = file.uuid;
          }
        });

        await Promise.all(fileCreationPromises);

        this.$store.commit('setCurrentProject', project.uuid);
        if (mainFileUUID) {
          this.$store.commit('setCurrentFile', mainFileUUID);
        }

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
