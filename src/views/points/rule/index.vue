<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>积分规则</span>
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="150px"
        :loading="loading"
      >
        <el-form-item label="订单分销比例" prop="orderDistributionRatio">
          <el-input-number
            v-model="form.orderDistributionRatio"
            :precision="2"
            :min="0"
            :max="100"
            :step="0.01"
            placeholder="请输入订单分销比例"
            style="width: 300px;"
            controls-position="right"
          />
          <span style="margin-left: 10px; color: #909399;">%（0-100之间的数值）</span>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getPointsRuleDetail, createPointsRule, updatePointsRule } from '@/api/points'

export default {
  name: 'PointsRule',
  data() {
    return {
      loading: false,
      submitLoading: false,
      form: {
        orderDistributionRatio: null
      },
      rules: {
        orderDistributionRatio: [
          { required: true, message: '请输入订单分销比例', trigger: 'blur' },
          { type: 'number', min: 0, max: 100, message: '订单分销比例必须在0-100之间', trigger: 'blur' }
        ]
      },
      ruleId: null // 用于判断是新增还是更新
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取积分规则数据
    async fetchData() {
      this.loading = true
      try {
        // 假设获取规则ID为1的配置，或者可以调用获取列表接口取第一个
        // 这里先尝试获取ID为1的规则，如果不存在则为新增
        const response = await getPointsRuleDetail(1)
        if (response && response.data) {
          this.form.orderDistributionRatio = response.data.orderDistributionRatio || null
          this.ruleId = response.data.id
        }
      } catch (error) {
        // 如果获取失败（可能是404），说明还没有创建规则，保持为空
        console.log('获取积分规则失败，将创建新规则:', error)
        this.ruleId = null
      } finally {
        this.loading = false
      }
    },
    // 提交表单
    async handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true
        try {
          const submitData = {
            orderDistributionRatio: this.form.orderDistributionRatio
          }

          if (this.ruleId) {
            // 更新规则
            submitData.id = this.ruleId
            await updatePointsRule(submitData)
            this.$message.success('更新成功')
          } else {
            // 创建新规则
            const response = await createPointsRule(submitData)
            if (response && response.data && response.data.id) {
              this.ruleId = response.data.id
            }
            this.$message.success('保存成功')
          }
        } catch (error) {
          console.error('保存失败:', error)
          this.$message.error('保存失败，请稍后重试')
        } finally {
          this.submitLoading = false
        }
      })
    },
    // 重置表单
    handleReset() {
      this.$refs.form.resetFields()
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}
</style>

