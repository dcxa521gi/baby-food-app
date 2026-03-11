export const ingredientsData = [
  { age: '6个月 (吞咽期)', items: [
    { name: '强化铁米粉', nutrition: '富含铁元素，易消化', process: '温水冲调，由稀到稠，最初几天每天一勺' },
    { name: '苹果泥', nutrition: '富含维生素C和果胶', process: '去皮去核，蒸熟后用料理机打成细腻泥状' },
    { name: '南瓜泥', nutrition: '富含胡萝卜素，口感微甜', process: '去皮去籽，蒸熟压成泥，可加少许水调稀' },
    { name: '土豆泥', nutrition: '碳水化合物，提供能量', process: '去皮蒸熟，压成泥，加少许温水或奶调匀' },
    { name: '香蕉泥', nutrition: '钾元素丰富，润肠通便', process: '选择熟透的香蕉，去皮后用勺子压成泥，现吃现做防氧化' },
    { name: '胡萝卜泥', nutrition: '富含β-胡萝卜素，保护视力', process: '去皮切块蒸熟，加少许水打成细腻泥状' },
    { name: '红薯泥', nutrition: '膳食纤维丰富，口感香甜', process: '去皮蒸熟，压成泥，可加少许温水调稀' },
    { name: '西葫芦泥', nutrition: '水分充足，清热利尿', process: '去皮去瓤，蒸熟后打成泥' }
  ]},
  { age: '7-8个月 (蠕嚼期)', items: [
    { name: '瘦肉泥 (猪/牛)', nutrition: '优质蛋白质，血红素铁', process: '去筋膜，冷水下锅焯水，煮熟后用绞肉机打成细腻肉泥' },
    { name: '蛋黄', nutrition: '卵磷脂，铁，维生素A', process: '水煮全熟，取1/4开始尝试，用温水压成泥' },
    { name: '菠菜泥', nutrition: '铁，维生素，膳食纤维', process: '必须先焯水去草酸，切碎后打成泥' },
    { name: '鸡肉泥', nutrition: '高蛋白低脂肪，易消化', process: '去皮去筋膜，冷水下锅煮熟，打成细腻肉泥' },
    { name: '西兰花泥', nutrition: '维生素C，膳食纤维', process: '只取花朵部分，焯水煮软后打成泥' },
    { name: '豌豆泥', nutrition: '植物蛋白，B族维生素', process: '煮熟去皮，压成泥，注意防呛' },
    { name: '猪肝泥', nutrition: '补铁佳品，维生素A', process: '清水浸泡去血水，煮熟后打成细腻泥状，每周1-2次' },
    { name: '燕麦糊', nutrition: '膳食纤维，B族维生素', process: '选择无糖纯燕麦，煮至软烂成糊状' }
  ]},
  { age: '9-11个月 (细嚼期)', items: [
    { name: '软烂面条', nutrition: '碳水化合物，提供能量', process: '选择无盐碎面，煮至软烂，可加入肉末和菜碎' },
    { name: '深海鱼 (鳕鱼/三文鱼)', nutrition: 'DHA，优质蛋白', process: '清蒸去刺，用勺子压成小块（注意排查过敏）' },
    { name: '豆腐', nutrition: '植物蛋白，钙', process: '选择老豆腐或嫩豆腐，焯水后切小丁' },
    { name: '虾肉泥', nutrition: '优质蛋白，钙，锌', process: '去虾线去壳，煮熟后剁成细碎末' },
    { name: '番茄', nutrition: '番茄红素，开胃', process: '开水烫去皮，切碎煮成番茄酱或番茄汤' },
    { name: '玉米糊/碎', nutrition: '粗粮，膳食纤维', process: '鲜玉米打碎煮熟，或用细玉米面熬糊' },
    { name: '香菇末', nutrition: '多糖，提升免疫力', process: '泡发洗净，焯水后切极细碎末' },
    { name: '牛肉末', nutrition: '补铁补锌，增强体质', process: '去筋膜剁碎，可加少许淀粉抓匀使口感变嫩' }
  ]},
  { age: '12个月以上 (咀嚼期)', items: [
    { name: '全蛋', nutrition: '全营养食物', process: '可做水蒸蛋、炒鸡蛋、鸡蛋软饼' },
    { name: '虾仁', nutrition: '优质蛋白，钙', process: '去虾线，切成适合宝宝咀嚼的小块，可做虾滑或炒虾仁' },
    { name: '软饭', nutrition: '碳水化合物', process: '比成人米饭多加水，煮得软烂一些' },
    { name: '各种鲜果', nutrition: '维生素，膳食纤维', process: '切成小块，让宝宝自己抓着吃（手指食物）' },
    { name: '奶酪', nutrition: '高钙，优质蛋白', process: '选择低钠原制奶酪，可夹在面包或拌入面条中' },
    { name: '排骨汤/肉汤', nutrition: '脂肪，风味', process: '撇去浮油，用来煮面或煮粥，肉也要吃掉' },
    { name: '水饺/馄饨', nutrition: '碳水+蛋白+蔬菜', process: '皮薄馅嫩，馅料可包含肉类和各种蔬菜碎' },
    { name: '粗粮杂豆', nutrition: 'B族维生素，膳食纤维', process: '如红豆、绿豆、小米等，需提前浸泡煮至软烂' }
  ]}
];

export function findIngredient(foodName: string) {
  for (const group of ingredientsData) {
    for (const item of group.items) {
      if (foodName.includes(item.name) || item.name.includes(foodName)) {
        return item;
      }
    }
  }
  return null;
}
