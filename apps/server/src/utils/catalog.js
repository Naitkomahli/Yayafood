const pool = require('../db/pool');

async function getOptionsByProductIds(productIds) {
  if (productIds.length === 0) return {};

  const { rows } = await pool.query(
    `SELECT
       g.id AS group_id,
       g.product_id,
       g.name AS group_name,
       g.is_required,
       g.display_order AS group_order,
       v.id AS value_id,
       v.name AS value_name,
       v.additional_price,
       v.is_available,
       v.display_order AS value_order
     FROM product_option_groups g
     LEFT JOIN product_option_values v ON v.option_group_id = g.id
     WHERE g.product_id = ANY($1::uuid[])
     ORDER BY g.display_order ASC, v.display_order ASC`,
    [productIds]
  );

  const byProduct = {};
  for (const row of rows) {
    if (!byProduct[row.product_id]) byProduct[row.product_id] = {};
    if (!byProduct[row.product_id][row.group_id]) {
      byProduct[row.product_id][row.group_id] = {
        id: row.group_id,
        name: row.group_name,
        isRequired: row.is_required,
        displayOrder: row.group_order,
        values: [],
      };
    }
    if (row.value_id) {
      byProduct[row.product_id][row.group_id].values.push({
        id: row.value_id,
        name: row.value_name,
        additionalPrice: Number(row.additional_price),
        isAvailable: row.is_available,
        displayOrder: row.value_order,
      });
    }
  }

  const result = {};
  for (const [productId, groupsObj] of Object.entries(byProduct)) {
    result[productId] = Object.values(groupsObj);
  }
  return result;
}

function formatProduct(row, optionGroups = []) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    isAvailable: row.is_available,
    displayOrder: row.display_order,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
    optionGroups,
  };
}

module.exports = { getOptionsByProductIds, formatProduct };