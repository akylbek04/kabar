import { describe, it, expect } from "vitest";
import { resolveChatType } from "../../services/topic.service";

describe("resolveChatType", () => {
  it("returns chatType when explicitly set to 'supergroup'", () => {
    expect(resolveChatType({ chatType: "supergroup" })).toBe("supergroup");
  });

  it("returns chatType when explicitly set to 'dm'", () => {
    expect(resolveChatType({ chatType: "dm" })).toBe("dm");
  });

  it("returns chatType when explicitly set to 'group'", () => {
    expect(resolveChatType({ chatType: "group" })).toBe("group");
  });

  it("returns 'group' when isGroup is true and chatType is not set", () => {
    expect(resolveChatType({ isGroup: true })).toBe("group");
  });

  it("returns 'dm' when isGroup is false and chatType is not set", () => {
    expect(resolveChatType({ isGroup: false })).toBe("dm");
  });

  it("chatType takes priority over isGroup", () => {
    expect(resolveChatType({ chatType: "dm", isGroup: true })).toBe("dm");
  });

  it("returns 'dm' when neither chatType nor isGroup is set", () => {
    expect(resolveChatType({})).toBe("dm");
  });
});
