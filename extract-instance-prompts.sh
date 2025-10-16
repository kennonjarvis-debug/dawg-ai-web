#!/bin/bash
# Extract individual instance prompts from master file
# Usage: ./extract-instance-prompts.sh

set -e

MASTER_FILE="PHASE_3_INSTANCE_PROMPTS_COMPLETE.md"
OUTPUT_DIR="instance-prompts"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🚀 Extracting instance prompts from $MASTER_FILE"
echo ""

# Instance markers (exact emoji + text from grep results)
declare -a INSTANCES=(
    "🎨 Instance 1: Design System + Chat UI"
    "🧠 Instance 2: Jarvis AI Brain + NLU"
    "🎙️ Instance 3: Voice Interface (STT/TTS)"
    "🥁 Instance 4: Beat Engine (Search + Generate v0)"
    "🎤 Instance 5: Recording Manager + Takes"
    "✂️ Instance 6: Comp Engine (Auto-Comp + Crossfades)"
    "🎛️ Instance 7: Command Bus + DAW Actions"
    "🎚️ Instance 8: Effects Processor"
    "🎹 Instance 9: MIDI Editor + Piano Roll"
    "☁️ Instance 10: Cloud Storage + Projects"
    "🎛️ Instance 11: Mixing Console + Automation"
    "💾 Instance 12: Export + Bounce System"
    "🧪 Instance 13: Integration + E2E Tests"
)

# File names (without emoji)
declare -a FILENAMES=(
    "instance-1-design-system.md"
    "instance-2-jarvis-ai.md"
    "instance-3-voice-interface.md"
    "instance-4-beat-engine.md"
    "instance-5-recording-manager.md"
    "instance-6-comp-engine.md"
    "instance-7-command-bus.md"
    "instance-8-effects-processor.md"
    "instance-9-midi-editor.md"
    "instance-10-cloud-storage.md"
    "instance-11-mixing-console.md"
    "instance-12-export-bounce.md"
    "instance-13-integration-tests.md"
)

# Extract overview section (before Instance 1)
echo "Extracting overview..."
sed -n '1,/^## 🎨 Instance 1:/p' "$MASTER_FILE" | sed '$d' > "$OUTPUT_DIR/00-overview.md"
echo "✅ Created: $OUTPUT_DIR/00-overview.md"

# Extract each instance
for i in "${!INSTANCES[@]}"; do
    INSTANCE_NUM=$((i + 1))
    INSTANCE_NAME="${INSTANCES[$i]}"
    OUTPUT_FILE="${FILENAMES[$i]}"

    echo "Extracting Instance $INSTANCE_NUM: ${INSTANCE_NAME:4}..."

    # For instances 1-12, extract from current to next instance
    if [ $i -lt 12 ]; then
        NEXT_INSTANCE="${INSTANCES[$((i + 1))]}"
        sed -n "/^## $INSTANCE_NAME/,/^## $NEXT_INSTANCE/p" "$MASTER_FILE" | sed '$d' > "$OUTPUT_DIR/$OUTPUT_FILE"
    else
        # For instance 13, extract from current to "Final Deliverables" section
        sed -n "/^## $INSTANCE_NAME/,/^## 📦 Final Deliverables/p" "$MASTER_FILE" | sed '$d' > "$OUTPUT_DIR/$OUTPUT_FILE"
    fi

    echo "✅ Created: $OUTPUT_DIR/$OUTPUT_FILE"
done

# Extract final deliverables section
echo "Extracting final deliverables..."
sed -n '/^## 📦 Final Deliverables/,$p' "$MASTER_FILE" > "$OUTPUT_DIR/99-final-deliverables.md"
echo "✅ Created: $OUTPUT_DIR/99-final-deliverables.md"

echo ""
echo "🎉 Extraction complete! All instance prompts saved to $OUTPUT_DIR/"
echo ""
echo "📋 Next steps:"
echo "1. cd $OUTPUT_DIR"
echo "2. Open 13 Claude Code sessions"
echo "3. In each session, share the corresponding instance-N-*.md file"
echo "4. Claude will read the prompt and begin work"
echo ""
echo "Or use this quick command to view all files:"
echo "ls -lh $OUTPUT_DIR/"
