<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>地址选择器演示</span>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>单选模式</span>
            </div>
            
            <el-form label-width="100px">
              <el-form-item label="选择地址">
                <el-input 
                  v-model="singleSelectedText" 
                  placeholder="请选择地址" 
                  readonly
                  style="width: 100%;"
                >
                  <el-button slot="append" @click="showSingleSelector">
                    选择地址
                  </el-button>
                </el-input>
              </el-form-item>
              
              <el-form-item label="选中结果">
                <el-tag v-if="singleSelectedAddress" type="success">
                  {{ singleSelectedAddress.accountName }} - {{ singleSelectedAddress.realAddress }}
                </el-tag>
                <span v-else style="color: #999;">未选择地址</span>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <div slot="header">
              <span>多选模式</span>
            </div>
            
            <el-form label-width="100px">
              <el-form-item label="选择地址">
                <el-button type="primary" @click="showMultipleSelector">
                  选择多个地址
                </el-button>
              </el-form-item>
              
              <el-form-item label="选中结果">
                <div v-if="multipleSelectedAddresses.length > 0">
                  <el-tag 
                    v-for="address in multipleSelectedAddresses" 
                    :key="address.id"
                    closable
                    @close="removeAddress(address)"
                    style="margin-right: 8px; margin-bottom: 8px;"
                  >
                    {{ address.accountName }} - {{ address.realAddress }}
                  </el-tag>
                </div>
                <span v-else style="color: #999;">未选择地址</span>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <div slot="header">
              <span>高级功能演示</span>
            </div>
            
            <el-form :inline="true" label-width="100px">
              <el-form-item label="默认选中">
                <el-input 
                  v-model="defaultSelectedIds" 
                  placeholder="输入地址ID，用逗号分隔"
                  style="width: 200px;"
                />
              </el-form-item>
              
              <el-form-item label="禁用地址">
                <el-input 
                  v-model="disabledAddressIds" 
                  placeholder="输入地址ID，用逗号分隔"
                  style="width: 200px;"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="warning" @click="showAdvancedSelector">
                  高级选择器
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 单选地址选择器 -->
    <AddressSelector 
      :visible.sync="singleSelectorVisible" 
      title="选择地址（单选）" 
      :multiple="false"
      @confirm="handleSingleSelected" 
    />
    
    <!-- 多选地址选择器 -->
    <AddressSelector 
      :visible.sync="multipleSelectorVisible" 
      title="选择地址（多选）" 
      :multiple="true"
      @confirm="handleMultipleSelected" 
    />
    
    <!-- 高级地址选择器 -->
    <AddressSelector 
      :visible.sync="advancedSelectorVisible" 
      title="高级地址选择器" 
      :multiple="true"
      :default-selected="defaultSelectedArray"
      :disabled-addresses="disabledAddressesArray"
      @confirm="handleAdvancedSelected" 
    />
  </div>
</template>

<script>
import AddressSelector from '@/components/AddressSelector'

export default {
  name: 'AddressSelectorDemo',
  components: {
    AddressSelector
  },
  data() {
    return {
      // 单选相关
      singleSelectorVisible: false,
      singleSelectedAddress: null,
      singleSelectedText: '',
      
      // 多选相关
      multipleSelectorVisible: false,
      multipleSelectedAddresses: [],
      
      // 高级功能相关
      advancedSelectorVisible: false,
      defaultSelectedIds: '1,2',
      disabledAddressIds: '3,4'
    }
  },
  computed: {
    defaultSelectedArray() {
      return this.defaultSelectedIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
        .map(id => parseInt(id))
    },
    disabledAddressesArray() {
      return this.disabledAddressIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
        .map(id => parseInt(id))
    }
  },
  methods: {
    // 显示单选选择器
    showSingleSelector() {
      this.singleSelectorVisible = true
    },
    
    // 单选回调
    handleSingleSelected(addresses) {
      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        this.singleSelectedAddress = address
        this.singleSelectedText = `${address.accountName} - ${address.realAddress}`
        this.$message.success('单选地址成功')
      }
    },
    
    // 显示多选选择器
    showMultipleSelector() {
      this.multipleSelectorVisible = true
    },
    
    // 多选回调
    handleMultipleSelected(addresses) {
      this.multipleSelectedAddresses = addresses || []
      this.$message.success(`多选地址成功，共选择 ${addresses.length} 个地址`)
    },
    
    // 移除多选地址
    removeAddress(address) {
      const index = this.multipleSelectedAddresses.findIndex(a => a.id === address.id)
      if (index > -1) {
        this.multipleSelectedAddresses.splice(index, 1)
      }
    },
    
    // 显示高级选择器
    showAdvancedSelector() {
      this.advancedSelectorVisible = true
    },
    
    // 高级选择器回调
    handleAdvancedSelected(addresses) {
      this.multipleSelectedAddresses = addresses || []
      this.$message.success(`高级选择成功，共选择 ${addresses.length} 个地址`)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  .el-card {
    margin-bottom: 20px;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
}
</style> 