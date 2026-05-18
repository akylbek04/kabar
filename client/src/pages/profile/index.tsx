import { useState, useRef, type ChangeEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AVATAR_MAX_BYTES,
  formatMaxFileSize,
  getMediaUrl,
} from "@/lib/helper";
import { ArrowLeft, Camera, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [description, setDescription] = useState(user?.description || "");
  const [status, setStatus] = useState(user?.status || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar ? getMediaUrl(user.avatar) : null
  );
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > AVATAR_MAX_BYTES) {
      alert(`Image must be under ${formatMaxFileSize(AVATAR_MAX_BYTES)}`);
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const handleSave = () => {
    if (isUpdatingProfile) return;

    const data: {
      name?: string;
      description?: string;
      status?: string;
      avatar?: File;
    } = {};

    if (name.trim() && name !== user?.name) data.name = name.trim();
    if (description !== (user?.description || ""))
      data.description = description;
    if (status !== (user?.status || "")) data.status = status;
    if (avatarFile) data.avatar = avatarFile;

    if (Object.keys(data).length === 0) return;

    updateProfile(data);
  };

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <div
        className="
          relative overflow-hidden
          bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50
          dark:from-primary/40 dark:via-primary/25 dark:to-primary/10
        "
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 px-4 pt-4 pb-20">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground mt-2 ml-1">
            Edit Profile
          </h1>
          <p className="text-sm text-primary-foreground/70 ml-1 mt-0.5">
            Personalize how others see you
          </p>
        </div>
      </div>

      {/* Avatar (overlapping header) */}
      <div className="relative z-20 flex justify-center -mt-14">
        <div className="relative group">
          <div
            className="
              rounded-full p-1
              bg-background
              shadow-lg shadow-primary/10
              ring-4 ring-background
            "
          >
            <Avatar className="w-24 h-24 cursor-pointer transition-transform duration-200 group-hover:scale-105">
              <AvatarImage src={avatarPreview || ""} />
              <AvatarFallback
                className="
                  bg-primary/10 text-primary
                  text-2xl font-bold
                "
              >
                {user?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Camera overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              absolute bottom-0 right-0
              h-8 w-8 rounded-full
              bg-primary text-primary-foreground
              flex items-center justify-center
              shadow-md
              border-2 border-background
              transition-all duration-200
              hover:scale-110 hover:shadow-lg
              cursor-pointer
            "
          >
            <Camera className="h-3.5 w-3.5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* User info subtitle */}
      <div className="text-center mt-3 mb-6">
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-5 pb-10 space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="profile-name" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Display Name
          </Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
            className="
              bg-card border-border/60
              focus-visible:border-primary/50
              transition-all duration-200
            "
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-status" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Status
            </Label>
            <span className="text-xs text-muted-foreground">
              {status.length}/100
            </span>
          </div>
          <Input
            id="profile-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={100}
            className="
              bg-card border-border/60
              focus-visible:border-primary/50
              transition-all duration-200
            "
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-description" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              About Me
            </Label>
            <span className="text-xs text-muted-foreground">
              {description.length}/200
            </span>
          </div>
          <Textarea
            id="profile-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell others about yourself..."
            maxLength={200}
            rows={3}
            className="
              bg-card border-border/60
              focus-visible:border-primary/50
              transition-all duration-200
              resize-none
            "
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isUpdatingProfile || !name.trim()}
          className="
            w-full h-11 gap-2
            font-semibold
            shadow-md shadow-primary/20
            transition-all duration-200
            hover:shadow-lg hover:shadow-primary/30
            hover:-translate-y-0.5
            active:translate-y-0
          "
        >
          {isUpdatingProfile ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isUpdatingProfile ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
