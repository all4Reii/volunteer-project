<template>
  <div class="activity-register">
    <el-page-header @back="$router.back()" content="活动报名" style="margin-bottom:20px" />
    <el-card>
      <el-result icon="success" title="报名成功！" sub-title="您的报名申请已提交，请等待管理员审核。">
        <template #extra>
          <el-button type="primary" @click="$router.push('/register')">查看我的报名</el-button>
          <el-button @click="$router.push('/activities')">继续浏览活动</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ActivityRegister',
  props: { activityId: { type: [String, Number], required: true } }
}
</script>
