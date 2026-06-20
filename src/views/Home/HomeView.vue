<template>
  <div class="home">
    <el-row :gutter="24">
      <el-col :span="16">
        <el-card class="banner-card" shadow="hover">
          <div class="banner">
            <h1>欢迎来到志愿服务平台</h1>
            <p>奉献、友爱、互助、进步 —— 加入我们，让世界更美好</p>
            <el-button type="primary" size="large" @click="$router.push('/activities')">查看志愿活动</el-button>
          </div>
        </el-card>
        <el-card header="最新志愿活动" class="section-card" v-loading="loading">
          <el-row :gutter="16">
            <el-col :span="8" v-for="item in recentActivities" :key="item.id">
              <el-card shadow="hover" :body-style="{ padding: '0' }" class="activity-mini" @click="$router.push(`/activity/${item.id}`)">
                <img :src="item.image" class="mini-img" />
                <div class="mini-info">
                  <h4>{{ item.title }}</h4>
                  <p><el-icon><Location /></el-icon> {{ item.region }} | {{ item.date }}</p>
                  <el-tag :type="item.status === 'recruiting' ? 'success' : 'warning'" size="small">{{ item.status === 'recruiting' ? '招募中' : '已满额' }}</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="🏆 志愿排行 TOP5" class="section-card">
          <div class="rank-mini" v-for="r in topRankings" :key="r.userId" @click="$router.push('/ranking')">
            <span class="rank-badge" :class="'rank-' + r.rank">{{ r.rank }}</span>
            <span class="rank-name">{{ r.userName }}</span>
            <span class="rank-hours">{{ r.totalHours }}h</span>
          </div>
          <el-button link style="width:100%;margin-top:8px" @click="$router.push('/ranking')">查看完整排行 →</el-button>
        </el-card>
        <el-card header="📋 服务统计" class="section-card">
          <el-statistic title="累计志愿活动" :value="activities.length" />
          <el-statistic title="注册志愿者" :value="topRankings.length" />
          <el-statistic title="总服务时长(h)" :value="totalHours" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
export default {
  name: 'HomeView',
  setup() {
    const store = useStore()
    onMounted(async () => {
      await store.dispatch('fetchActivities')
      await store.dispatch('fetchRankings')
    })
    const activities = computed(() => store.state.activities)
    const rankings = computed(() => store.state.rankings)
    const loading = computed(() => store.state.loading)
    const recentActivities = computed(() => activities.value.slice(0, 6))
    const topRankings = computed(() => rankings.value.slice(0, 5))
    const totalHours = computed(() => rankings.value.reduce((s, r) => s + r.totalHours, 0))
    return { recentActivities, topRankings, totalHours, loading, activities }
  }
}
</script>

<style scoped>
.banner-card { margin-bottom: 24px; background: linear-gradient(135deg, #409eff, #337ecc); color: #fff; }
.banner { padding: 32px; text-align: center; }
.banner h1 { font-size: 32px; margin-bottom: 12px; }
.banner p { font-size: 16px; margin-bottom: 20px; opacity: .9; }
.section-card { margin-bottom: 24px; }
.activity-mini { cursor: pointer; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
.mini-img { width: 100%; height: 120px; object-fit: cover; }
.mini-info { padding: 12px; }
.mini-info h4 { font-size: 14px; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mini-info p { font-size: 12px; color: #909399; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.rank-mini { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background .2s; }
.rank-mini:hover { background: #f5f7fa; }
.rank-badge { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; background: #909399; }
.rank-badge.rank-1 { background: #f56c6c; }
.rank-badge.rank-2 { background: #e6a23c; }
.rank-badge.rank-3 { background: #67c23a; }
.rank-name { flex: 1; font-size: 14px; }
.rank-hours { font-weight: bold; color: #409eff; }
</style>
