import { normalizeNonNegativeInteger } from "../../../../../shared/numbers.js";
import {
  applyNode3DTransformProperties,
  applyOptionalNumberProperty,
  mergeCustomProperties
} from "../shared.js";

export function buildRigidBody3DProperties(payload) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  applyOptionalNumberProperty(properties, "mass", payload.mass);
  applyOptionalNumberProperty(properties, "gravity_scale", payload.gravityScale);
  applyOptionalNumberProperty(properties, "linear_damp", payload.linearDamp);
  applyOptionalNumberProperty(properties, "angular_damp", payload.angularDamp);

  if (payload.contactMonitor !== undefined) {
    properties.contact_monitor = Boolean(payload.contactMonitor);
  }
  if (payload.maxContactsReported !== undefined) {
    properties.max_contacts_reported = normalizeNonNegativeInteger(
      payload.maxContactsReported,
      "maxContactsReported"
    );
  }
  if (payload.freeze !== undefined) {
    properties.freeze = Boolean(payload.freeze);
  }
  if (payload.lockRotation !== undefined) {
    properties.lock_rotation = Boolean(payload.lockRotation);
  }
  if (payload.canSleep !== undefined) {
    properties.can_sleep = Boolean(payload.canSleep);
  }
  if (payload.sleeping !== undefined) {
    properties.sleeping = Boolean(payload.sleeping);
  }
  if (payload.continuousCd !== undefined) {
    properties.continuous_cd = Boolean(payload.continuousCd);
  }
  mergeCustomProperties(properties, payload.properties, "properties");

  return properties;
}
