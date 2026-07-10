import os

filepath = 'app.js'
with open(filepath, 'r') as f:
    js = f.read()

# Add portalConfig to createClientBlankState
old_blank = """    creativeBrief: {}
  };
}"""

new_blank = """    creativeBrief: {},
    portalConfig: {
      accountManagerName: "",
      accountManagerEmail: "",
      accountManagerPhone: "",
      calendlyLink: "",
      projectsEmbedUrl: "",
      calendarEmbedUrl: "",
      feedbackFormUrl: "",
      brandAssetsUrl: "",
      liveAnalyticsUrl: "",
      primaryColor: "#10b981",
      magicToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  };
}"""

if old_blank in js:
    js = js.replace(old_blank, new_blank)
    print("Patched createClientBlankState")

# Add to migrateSchemaAndDefaults
old_migrate = """    if (!client.creativeBrief || Array.isArray(client.creativeBrief) || typeof client.creativeBrief !== 'object') {
      client.creativeBrief = {};
    }
  });
}"""

new_migrate = """    if (!client.creativeBrief || Array.isArray(client.creativeBrief) || typeof client.creativeBrief !== 'object') {
      client.creativeBrief = {};
    }
    if (!client.portalConfig || typeof client.portalConfig !== 'object') {
      client.portalConfig = blank.portalConfig;
    }
  });
}"""

if old_migrate in js:
    js = js.replace(old_migrate, new_migrate)
    print("Patched migrateSchemaAndDefaults")

with open(filepath, 'w') as f:
    f.write(js)
print("Done patching app.js for portalConfig schema.")
