
'use strict';

const { bad, ok, requireActor, safeProfile, userManagementScopeAllowed, hasUserManagementPermission } = require('./_firebase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return bad(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  try {
    const { db, actor } = await requireActor(event);
    if (!hasUserManagementPermission(actor)) return bad(403, 'USER_MANAGEMENT_PERMISSION_REQUIRED', 'Akun tidak memiliki permission User Management.');
    const snap = await db.collection('users').orderBy('username').get();
    const users = snap.docs.map(d => safeProfile({ id: d.id, ...d.data() }));
    const visible = actor.role === 'Super Admin' ? users : users.filter(u => u.role === 'Super Admin' || userManagementScopeAllowed(actor, u.scopeType, u.airports, u.loungeIds));
    return ok({ users: visible });
  } catch (e) {
    console.error('auth-list-users failed:', e.message);
    return bad(e.statusCode || 500, e.code || 'LIST_USERS_FAILED', e.statusCode ? e.message : 'Daftar user gagal diambil.');
  }
};
