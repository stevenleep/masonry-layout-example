<template>
  <button type="button" @click="add">添加 10 条</button>
  <button type="button" @click="updateColumn([0, 1], 600)">
    更新 [0,1] 的 Top
  </button>
  <button type="button" @click="addColumn">
    添加一列
  </button>
  <button type="button" @click="deleteColumn">
    减少一列
  </button>

  <div class="waterfall-wrapper" ref="waterfallRef" @load="wrapperLoading" :key="refresh">
    <div
      class="waterfall-item"
      v-for="(item, index) in items"
      :key="item.imageId"
    >
      <img
        class="waterfall-item-img"
        v-bind:src="`./src/images/${item.imageId}.jpg`"
        :alt="item.imageId.toString()"
        @load="loadImage(item, index)"
        @error="loadImage(item, index)"
      />
      <div>
      <button type="button" @click="handleDelete($event, index)">
        删除元素 - 列重排
      </button>
      <button type="button" @click="handleDeleteResize(index)">
        删除元素 - 组件重排
      </button>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
const refresh = ref({});

const caches = {};
const columnMaps = {}

let point = 10027;
let columns = 6;
const heightArr = Array(columns).fill(0);

const items = reactive(
  Array.from({ length: 10 }, (_, key) => ({
    imageId: (point = point + 1),
    style: {},
  }))
);

function addColumn() {
  columns += 1;
  refresh.value = {};
}

function deleteColumn() {
  columns -= 1;
  refresh.value = {};
}

function handleDeleteResize(index: number) {
  items.splice(index, 1);
  refresh.value = {};
}

function add() {
  items?.push(
    ...Array.from({ length: 10 }, (_, key) => ({
      imageId: (point = point + 1),
      style: {},
    }))
  );
}

const waterfallRef = ref(null);

const wrapperLoading = () => {
  console.log("wrapperLoading");
};

const loadImage = (iq, itemIndex) => {
  const waterfall = waterfallRef.value;
  const items = waterfall!.querySelectorAll(".waterfall-item");
  const itemWidth = (waterfall?.offsetWidth - (columns - 1) * 10) / columns;
  const item = items[itemIndex];
  if (!item) return;
  item.style.width = `${itemWidth}px`;
  if (itemIndex < columns) {
    item.style.top = 0;
    item.style.left = itemIndex * (itemWidth + 10) + "px";

    // 列和行位置
    item.dataset.row = 0;
    item.dataset.column = itemIndex;

    caches[`y${itemIndex}`] = [item];
    columnMaps[itemIndex] = 0;

    // 记录高度
    heightArr[itemIndex] = item.offsetHeight;
  } else {
    const minHeight = Math.min.apply(null, heightArr);
    const minIndex = heightArr.indexOf(minHeight);

    item.style.top = minHeight + 10 + "px";
    item.style.left = minIndex * (itemWidth + 10) + "px";

    columnMaps[minIndex] = columnMaps[minIndex] + 1;
    caches[`y${minIndex}`].push(item);

    // 列和行位置
    item.dataset.row = columnMaps[minIndex];
    item.dataset.index = itemIndex;
    item.dataset.column = minIndex;

    heightArr[minIndex] += item.offsetHeight + 10;
  }

  // TODO: 显示图片
  // item.getElementsByClassName("waterfall-item-img")[0].style.opacity = 1;
};

const updateColumn = ([x = 0, y = 0], top = 0) => {
  const columns = caches[`y${y}`] || [];
  // const target = columns?.[x];
  // 更新x后面的元素
  for (let index = x; index < columns.length; index++) {
    const item = columns[index];
    item.style.top = `${top + 10}px`;
    top = top + item.offsetHeight + 10;
  }
};

onMounted(() => {
window.addEventListener("resize", () => {
  refresh.value = {};
});
})

onUnmounted(() => {
window.removeEventListener("resize", () => {});
})

const handleDelete = (event: UIEvent, index: number) => {
  /**
   * 在瀑布流中如何删除一个元素
   * 
   * 步骤如下:
   * 1. 获取当前点击的元素位置
   * 2. 通过元素去找到当前包裹的child
   * 3. 通过child去找到当前所在列
   * 4. 通过index去找到当前元素在列中的位置
   * 5. 获得当前元素的高度，同时更新当前列后面所有的元素的top值
   */
  //  使用closest获取包裹的child
  const clickedElement = document.elementFromPoint(event.clientX, event.clientY);
  const child =  clickedElement && clickedElement.closest(".waterfall-item");
  const childRow = child?.getAttribute("data-row");
  const childY = child?.getAttribute("data-column");
  const childOffsetHeight = child?.offsetHeight;

  const currentColumn = caches[`y${childY}`] || [];
  const target = currentColumn?.[childRow];
  // const targetLeft = target?.offsetLeft;

  target?.remove();
  
  // 将数组按照index分为两部分
  const resetColumn = currentColumn.slice(Number(childRow) + 1);
  resetColumn.forEach((a, index) => {
    a.style.top = `${Number(a.style.top.replace("px", "")) - childOffsetHeight - 10}px`;
    if(index === resetColumn.length - 1) {
      heightArr[Number(childY)] = heightArr[Number(childY)] - childOffsetHeight - 10;

      // 重新排布剩余的元素
      // const first = caches[`y0`];
      // const fsc = first.slice(Number(childRow) + 1);
      // console.log(fsc, a.style.left);

      // fsc.forEach((b, index) => {
      //   console.log(b.style.left, a.style.left, heightArr[Number(childY)]);
      //   // const elbl = Number(b.style.left.replace("px", ""));
      //   const elbt = Number(b.style.top.replace("px", ""));
      //   console.log(elbt, heightArr[Number(childY)]);

      //   if(elbt >= heightArr[Number(childY)]) {
      //     b.style.top = `${heightArr[Number(childY)]}px`;
      //     b.style.left = `${targetLeft}px`;
      //   }
      // });
    }
  });
};

</script>

<style scoped>
.waterfall-wrapper {
  /* width: 600px; */
  height: 100%;
  background: red;
  position: relative;
}
.waterfall-item {
  position: absolute;
  background-color: antiquewhite;
}
.waterfall-item > img {
  opacity: 0;
  transition: opacity 3s;
  width: 100%;
  height: 100%;
}

button {
  border: none;
  outline: none;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  box-shadow: 0 0 5px #ccc;
  background-color: #fff;
  cursor: pointer;
  margin: 0 2px;
}
</style>
