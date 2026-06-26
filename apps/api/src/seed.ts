import "dotenv/config";

import {
  ALL_PERMISSIONS,
  RESPONSIBILITY_GROUPS,
  RESPONSIBILITY_GROUP_LABELS,
  RESPONSIBILITY_GROUP_PERMISSIONS,
  USER_ROLES,
} from "@techtrack/shared";
import {
  db,
  permissions,
  productCategories,
  responsibilityGroupPermissions,
  responsibilityGroups,
  userResponsibilityGroups,
  users,
} from "@techtrack/db";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD;
  const ownerName = process.env.OWNER_NAME || "Owner";
  const ownerPhone = process.env.OWNER_PHONE;
  const staffEmail = process.env.STAFF_EMAIL?.toLowerCase();
  const staffPassword = process.env.STAFF_PASSWORD;
  const staffName = process.env.STAFF_NAME || "Suparsale Staff";
  const staffPhone = process.env.STAFF_PHONE;

  const suparsaleCategories = [
    "Smart TVs",
    "Digital TVs",
    "Big TVs",
    "Small TVs",
    "Fridges",
    "Irons",
    "Washing Machines",
    "Fans",
    "Bicycles",
    "Electronics Accessories",
    "Home Appliances",
    "Other Electronics Materials",
  ];

  if (!ownerEmail || !ownerPassword) {
    throw new Error("OWNER_EMAIL and OWNER_PASSWORD are required");
  }

  console.log("Seeding permissions...");

  for (const permissionKey of ALL_PERMISSIONS) {
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.key, permissionKey))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(permissions).values({
        key: permissionKey,
        description: permissionKey,
      });
    }
  }

  console.log("Seeding responsibility groups...");

  for (const groupKey of Object.values(RESPONSIBILITY_GROUPS)) {
    const existing = await db
      .select()
      .from(responsibilityGroups)
      .where(eq(responsibilityGroups.key, groupKey))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(responsibilityGroups).values({
        key: groupKey,
        name: RESPONSIBILITY_GROUP_LABELS[groupKey],
        description: RESPONSIBILITY_GROUP_LABELS[groupKey],
      });
    }
  }

  console.log("Seeding responsibility group permissions...");

  for (const [groupKey, groupPermissionKeys] of Object.entries(
    RESPONSIBILITY_GROUP_PERMISSIONS,
  )) {
    const [group] = await db
      .select()
      .from(responsibilityGroups)
      .where(eq(responsibilityGroups.key, groupKey))
      .limit(1);

    if (!group) continue;

    for (const permissionKey of groupPermissionKeys) {
      const [permission] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.key, permissionKey))
        .limit(1);

      if (!permission) continue;

      const existing = await db
        .select()
        .from(responsibilityGroupPermissions)
        .where(eq(responsibilityGroupPermissions.permissionId, permission.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(responsibilityGroupPermissions).values({
          responsibilityGroupId: group.id,
          permissionId: permission.id,
        });
      }
    }
  }

  console.log("Seeding Suparsale product categories...");

  for (const categoryName of suparsaleCategories) {
    const existing = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.name, categoryName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(productCategories).values({
        name: categoryName,
        description: `${categoryName} sold by Suparsale Store Ltd`,
      });
    }
  }

  console.log("Seeding owner...");

  const existingOwner = await db
    .select()
    .from(users)
    .where(eq(users.email, ownerEmail))
    .limit(1);

  if (existingOwner.length === 0) {
    const passwordHash = await bcrypt.hash(ownerPassword, 12);

    await db.insert(users).values({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      passwordHash,
      role: USER_ROLES.OWNER,
      isActive: true,
    });

    console.log(`Owner created: ${ownerEmail}`);
  } else {
    console.log(`Owner already exists: ${ownerEmail}`);
  }

  if (staffEmail && staffPassword) {
    console.log("Seeding limited staff account...");

    const existingStaff = await db
      .select()
      .from(users)
      .where(eq(users.email, staffEmail))
      .limit(1);

    let staffId = existingStaff[0]?.id;

    if (existingStaff.length === 0) {
      const passwordHash = await bcrypt.hash(staffPassword, 12);

      const [staff] = await db
        .insert(users)
        .values({
          name: staffName,
          email: staffEmail,
          phone: staffPhone,
          passwordHash,
          role: USER_ROLES.EMPLOYEE,
          isActive: true,
        })
        .returning();

      staffId = staff.id;
      console.log(`Limited staff created: ${staffEmail}`);
    } else {
      console.log(`Limited staff already exists: ${staffEmail}`);
    }

    if (staffId) {
      for (const groupKey of [
        RESPONSIBILITY_GROUPS.SELLER,
        RESPONSIBILITY_GROUPS.CASHIER,
        RESPONSIBILITY_GROUPS.STOREKEEPER,
      ]) {
        const [group] = await db
          .select()
          .from(responsibilityGroups)
          .where(eq(responsibilityGroups.key, groupKey))
          .limit(1);

        if (!group) continue;

        const existingGroup = await db
          .select()
          .from(userResponsibilityGroups)
          .where(
            and(
              eq(userResponsibilityGroups.userId, staffId),
              eq(userResponsibilityGroups.responsibilityGroupId, group.id),
            ),
          )
          .limit(1);

        if (existingGroup.length === 0) {
          await db.insert(userResponsibilityGroups).values({
            userId: staffId,
            responsibilityGroupId: group.id,
          });
        }
      }
    }
  }

  console.log("Seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
