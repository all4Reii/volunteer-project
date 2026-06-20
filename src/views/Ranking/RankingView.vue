<template>
  <div class="ranking-view">
    <el-card header="🏆 志愿积分排行榜" v-loading="loading">
      <el-table :data="rankings" border stripe :default-sort="{ prop: 'totalHours', order: 'descending' }" highlight-current-row>
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ row }">
            <span class="rank-cell" :class="'rank-' + row.rank">
              <el-icon v-if="row.rank === 1" :size="24"><Medal /></el-icon>
              {{ row.rank }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="志愿者姓名" min-width="140" />
        <el-table-column prop="totalHours" label="总服务时长(h)" width="140" sortable>
          <template #default="{ row }">
            <el-progress :percentage="row.totalHours / maxHours * 100" :stroke-width="14" :color="rankColor(row.rank)">
              <span style="font-weight:bold;font-size:13px">{{ row.totalHours }}h</span>
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="activities" label="参与活动数" width="120" sortable />
        <el-table-column label="等级" width="120">
          <template #default="{ row }">
            <el-tag :type="levelType(row)" size="large" effect="dark">{{ levelName(row) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card header="📊 统计概览" style="margin-top:20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-statistic title="总志愿者数" :value="rankings.length" suffix="人" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="累计服务时长" :value="totalAllHours" suffix="小时" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="人均服务时长" :value="avgHours" suffix="小时" :precision="1" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'RankingView',
  setup() {
    const store = useStore()
    onMounted(() => store.dispatch('fetchRankings'))

    const rankings = computed(() => store.state.rankings)
    const loading = computed(() => store.state.loading)
    const maxHours = computed(() => rankings.value.length ? rankings.value[0].totalHours : 1)
    const totalAllHours = computed(() => rankings.value.reduce((s, r) => s + r.totalHours, 0))
    const avgHours = computed(() => rankings.value.length ? totalAllHours.value / rankings.value.length : 0)

    const rankColor = (rank) => rank === 1 ? '#f56c6c' : rank === 2 ? '#e6a23c' : rank === 3 ? '#67c23a' : '#409eff'
    const levelType = (row) => row.totalHours >= 60 ? 'danger' : row.totalHours >= 40 ? 'warning' : row.totalHours >= 20 ? 'success' : 'info'
    const levelName = (row) => row.totalHours >= 60 ? '五星志愿者' : row.totalHours >= 40 ? '四星志愿者' : row.totalHours >= 20 ? '三星志愿者' : '初级志愿者'

    return { rankings, loading, maxHours, totalAllHours, avgHours, rankColor, levelType, levelName }
  }
}
</script>

<style scoped>
.rank-cell { display: flex; align-items: center; justify-content: center; gap: 4px; font-weight: bold; font-size: 16px; }
.rank-cell.rank-1 { color: #f56c6c; }
.rank-cell.rank-2 { color: #e6a23c; }
.rank-cell.rank-3 { color: #67c23a; }
</style>
