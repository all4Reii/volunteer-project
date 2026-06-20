<template>
  <div id="app">
    <el-container class="layout">
      <el-header class="header">
        <div class="logo" @click="$router.push('/')">
          <el-icon :size="28"><Finished /></el-icon>
          <span>志愿服务平台</span>
        </div>
        <el-menu mode="horizontal" :default-active="activeMenu" router class="nav-menu">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/activities">志愿活动</el-menu-item>
          <el-menu-item index="/register">报名管理</el-menu-item>
          <el-menu-item index="/service-records">服务时长</el-menu-item>
          <el-menu-item index="/certificates">志愿证书</el-menu-item>
          <el-menu-item index="/styles">活动风采</el-menu-item>
          <el-menu-item index="/ranking">志愿排行榜</el-menu-item>
        </el-menu>
        <div class="user-info">
          <template v-if="$store.state.isLoggedIn">
            <el-dropdown trigger="click">
              <span class="user-dropdown">
                <el-icon :size="18"><UserFilled /></el-icon>
                {{ $store.state.currentUser?.name }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>{{ $store.state.currentUser?.phone }}</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="$router.push('/login')">登录 / 注册</el-button>
          </template>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <span>© 2026 志愿者服务平台 | 奉献、友爱、互助、进步</span>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const activeMenu = computed(() => '/' + route.path.split('/')[1])
    const handleLogout = () => {
      store.dispatch('logout')
      ElMessage.success('已安全退出')
      router.push('/login')
    }
    return { activeMenu, handleLogout }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f5f7fa; }
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.header { display: flex; align-items: center; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.08); padding: 0 24px; height: 60px; position: sticky; top: 0; z-index: 100; }
.logo { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 20px; font-weight: bold; color: #409eff; white-space: nowrap; margin-right: 20px; }
.nav-menu { flex: 1; border-bottom: none !important; }
.nav-menu .el-menu-item { font-size: 15px; border-bottom: 2px solid transparent; }
.nav-menu .el-menu-item.is-active { border-bottom-color: #409eff; color: #409eff; }
.user-info { margin-left: auto; }
.user-dropdown { display: flex; align-items: center; gap: 6px; cursor: pointer; color: #303133; font-size: 14px; }
.main-content { flex: 1; padding: 24px; max-width: 1200px; width: 100%; margin: 0 auto; }
.footer { text-align: center; color: #999; font-size: 13px; background: #fff; border-top: 1px solid #ebeef5; padding: 16px 0; }
</style>
