<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search.name" placeholder="名称" style="width: 140px;" clearable @clear="search.name=null" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <el-table
      :data="list"
      ref="table"
      style="width: 100%"
      row-key="id"
      border
      lazy
      :load="getChildrens"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="名称" width="230" align="left">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span></template>
      </el-table-column>

      <el-table-column label="编码" width="220">
        <template slot-scope="{ row }">
          {{ row.dictCode }}
        </template>
      </el-table-column>
      <el-table-column label="值" width="220" align="left">
        <template slot-scope="{ row }">
          <span>{{ row.dictValue }}</span></template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" :disabled="row.createBy==='system'" @click="handleCreate(row)">
            新增
          </el-button>
          <el-button type="primary" size="mini" :disabled="row.createBy==='system' && row.parentId===0" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" :disabled="row.createBy==='system'" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" center>
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" :disabled="temp.createBy === 'system'" />
        </el-form-item>
<!--        <el-form-item v-if="temp.parentId !== 0" label="父级" prop="parentId">
          <el-input v-model="temp.parentId" />
        </el-form-item>-->
        <el-form-item label="编码" prop="dictCode">
          <el-input v-model="temp.dictCode" :disabled="temp.createBy === 'system'" />
        </el-form-item>
        <el-form-item label="值" prop="dictValue">
          <el-input v-model="temp.dictValue" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDict, updateDict, deleteDict, dictChildrenList } from '@/api/dict'
// import { listAllRoleListData } from '@/api/role'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      search: { name: null },
      showReviewer: false,
      temp: {
        id: undefined,
        parentId: undefined,
        name: null,
        dictCode: null,
        dictValue: null,
        createBy: null,
        createTime: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'change' }]
      },
      downloadLoading: false,
      maps: new Map()
    }
  },
  created() {
    this.getList(0)
  },
  methods: {
    getList(id) {
      this.listLoading = true
      dictChildrenList(id).then(response => {
        this.list = response.data
        this.total = this.list.length
        this.listLoading = false
      })
    },
    // 获取子字典
    getChildrens(tree, treeNode, resolve) {
      this.maps.set(tree.id, { tree, treeNode, resolve }) // 储存数据
      dictChildrenList(tree.id)
        .then(response => {
          resolve(response.data)
        })
    },
    refreshLoadTree(lazyTreeNodeMap, maps, parentId) {
      if (maps.get(parentId)) {
        const { tree, treeNode, resolve } = maps.get(parentId)
        this.$set(lazyTreeNodeMap, parentId, [])
        if (tree) { // 重新执行父节点加载子级操作
          this.getChildrens(tree, treeNode, resolve)
          if (tree.parentId) { // 若存在爷爷结点，则执行爷爷节点加载子级操作，防止最后一个子节点被删除后父节点不显示删除按钮
            const a = maps.get(tree.parentId)
            this.getChildrens(a.tree, a.treeNode, a.resolve)
          }
        }
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList(0)
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        parentId: undefined,
        name: null,
        dictCode: null,
        dictValue: null,
        createBy: null,
        createTime: undefined
      }
    },
    handleCreate(row) {
      this.resetTemp()
      this.temp.parentId = row.id ? row.id : 0
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log('@', this.temp)
          createDict(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '创建成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, this.temp.parentId)
            // this.refresh()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // this.selectRoles()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateDict(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '更新成功',
              message: '操作成功',
              type: 'success',
              duration: 2000
            })
            this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, tempData.parentId)
            // this.refresh()
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除吗?', '操作提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDict(row.id).then(response => {
          // this.refresh()
          this.refreshLoadTree(this.$refs.table.store.states.lazyTreeNodeMap, this.maps, row.parentId)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    refresh() {
      // this.selectionArr = []
      // this.deleteArr = []
      // f && (this.listQuery.page = 1)
      this.getList(0)
    }
  }
}
</script>
