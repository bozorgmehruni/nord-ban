import type { AndroidProjectFile } from './androidProjectTemplate';

export const ANDROID_COMPOSE_UI_FILES: AndroidProjectFile[] = [
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/ObsidianTheme.kt',
    language: 'kotlin',
    description: 'Stitch Obsidian Telemetry palette, reusable glass cards, Canvas sparklines, and vector Obsidian Shield icon',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object ObsidianColors {
    val CanvasBg = Color(0xFF0F131C)
    val HeaderBg = Color(0xFF080C14)
    val InsetBg = Color(0xFF0A0E16)
    val CardBg = Color(0xFF181C24)
    val ElevatedBg = Color(0xFF262A33)
    val BorderSubtle = Color(0x14FFFFFF)
    val BorderInput = Color(0xFF424655)
    val PrimaryBlue = Color(0xFF2979FF)
    val AccentCyan = Color(0xFF00E5FF)
    val StatusEmerald = Color(0xFF00E676)
    val StatusAmber = Color(0xFFFFAB00)
    val StatusCrimson = Color(0xFFFF1744)
    val TextPrimary = Color(0xFFDFE2EE)
    val TextSecondary = Color(0xFFC2C6D7)
    val TextMuted = Color(0xFF8C90A0)
}

@Composable
fun ObsidianTelemetryTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = ObsidianColors.PrimaryBlue,
            secondary = ObsidianColors.AccentCyan,
            background = ObsidianColors.CanvasBg,
            surface = ObsidianColors.CardBg,
            surfaceVariant = ObsidianColors.ElevatedBg,
            onPrimary = Color(0xFFF8FAFC),
            onSecondary = ObsidianColors.HeaderBg,
            onBackground = ObsidianColors.TextPrimary,
            onSurface = ObsidianColors.TextPrimary,
            error = ObsidianColors.StatusCrimson
        ),
        content = content
    )
}

@Composable
fun ObsidianCard(
    modifier: Modifier = Modifier,
    borderColor: Color = ObsidianColors.BorderSubtle,
    containerColor: Color = ObsidianColors.CardBg,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(14.dp)
    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = shape,
            colors = CardDefaults.cardColors(containerColor = containerColor),
            border = BorderStroke(1.dp, borderColor)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                content = content
            )
        }
    } else {
        Card(
            modifier = modifier.fillMaxWidth(),
            shape = shape,
            colors = CardDefaults.cardColors(containerColor = containerColor),
            border = BorderStroke(1.dp, borderColor)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                content = content
            )
        }
    }
}

@Composable
fun ObsidianInsetBox(
    modifier: Modifier = Modifier,
    borderColor: Color = ObsidianColors.BorderSubtle,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        color = ObsidianColors.InsetBg,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            content = content
        )
    }
}

@Composable
fun ObsidianAppIcon(size: Dp = 32.dp) {
    Box(
        modifier = Modifier
            .size(size)
            .background(ObsidianColors.InsetBg, RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(3.dp)) {
            val w = this.size.width
            val h = this.size.height
            val shield = Path().apply {
                moveTo(w * 0.50f, h * 0.08f)
                lineTo(w * 0.88f, h * 0.24f)
                lineTo(w * 0.88f, h * 0.54f)
                cubicTo(w * 0.88f, h * 0.76f, w * 0.70f, h * 0.90f, w * 0.50f, h * 0.95f)
                cubicTo(w * 0.30f, h * 0.90f, w * 0.12f, h * 0.76f, w * 0.12f, h * 0.54f)
                lineTo(w * 0.12f, h * 0.24f)
                close()
            }
            drawPath(shield, color = ObsidianColors.CardBg)
            drawPath(shield, color = ObsidianColors.PrimaryBlue, style = Stroke(width = 2.2f))

            drawArc(
                color = ObsidianColors.AccentCyan,
                startAngle = -65f,
                sweepAngle = 215f,
                useCenter = false,
                topLeft = Offset(w * 0.27f, h * 0.28f),
                size = Size(w * 0.46f, h * 0.46f),
                style = Stroke(width = 2.6f, cap = StrokeCap.Round)
            )
            drawCircle(
                color = ObsidianColors.PrimaryBlue,
                radius = w * 0.11f,
                center = Offset(w * 0.50f, h * 0.52f)
            )
            drawCircle(
                color = ObsidianColors.StatusEmerald,
                radius = w * 0.06f,
                center = Offset(w * 0.72f, h * 0.32f)
            )
        }
    }
}

@Composable
fun SparklineCanvas(
    primaryValues: List<Float>,
    secondaryValues: List<Float> = emptyList(),
    maxValue: Float,
    primaryColor: Color,
    secondaryColor: Color = ObsidianColors.PrimaryBlue,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.fillMaxWidth().height(72.dp)) {
        val w = size.width
        val h = size.height
        // Subtle baseline dashed grid line
        drawLine(
            color = Color(0x14FFFFFF),
            start = Offset(0f, h * 0.5f),
            end = Offset(w, h * 0.5f),
            strokeWidth = 1f,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f), 0f)
        )

        fun buildLine(vals: List<Float>): Path {
            val p = Path()
            if (vals.isEmpty()) return p
            val step = w / maxOf(1, vals.size - 1)
            vals.forEachIndexed { idx, v ->
                val x = idx * step
                val clamped = v.coerceIn(0f, maxValue)
                val y = h - (clamped / maxOf(1f, maxValue)) * (h - 10f) - 5f
                if (idx == 0) p.moveTo(x, y) else p.lineTo(x, y)
            }
            return p
        }

        if (secondaryValues.size >= 2) {
            drawPath(
                path = buildLine(secondaryValues),
                color = secondaryColor,
                style = Stroke(
                    width = 3f,
                    cap = StrokeCap.Round,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 5f), 0f)
                )
            )
        }

        if (primaryValues.size >= 2) {
            val line = buildLine(primaryValues)
            val fill = Path().apply {
                addPath(line)
                lineTo(w, h)
                lineTo(0f, h)
                close()
            }
            drawPath(
                path = fill,
                brush = Brush.verticalGradient(
                    colors = listOf(primaryColor.copy(alpha = 0.22f), Color.Transparent)
                )
            )
            drawPath(
                path = line,
                color = primaryColor,
                style = Stroke(width = 4f, cap = StrokeCap.Round, join = StrokeJoin.Round)
            )
        }
    }
}

@Composable
fun SectionOverline(text: String) {
    Text(
        text = text.uppercase(),
        color = ObsidianColors.TextMuted,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.7.sp
    )
}

@Composable
fun MonoMetric(text: String, color: Color = ObsidianColors.TextPrimary, sizeSp: Int = 20) {
    Text(
        text = text,
        color = color,
        fontSize = sizeSp.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace
    )
}

fun formatDuration(sec: Long): String {
    val h = sec / 3600
    val m = (sec % 3600) / 60
    val s = sec % 60
    return "%02d:%02d:%02d".format(h, m, s)
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/DashboardScreen.kt',
    language: 'kotlin',
    description: 'Obsidian Telemetry Dashboard supporting both Simple 1-Tap Mode and Pro Telemetry KPI + Canvas Sparklines + 4-Stage Routing',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nord.ikev2explorer.scanner.BanStatus
import com.nord.ikev2explorer.scanner.HandshakeTrace
import com.nord.ikev2explorer.scanner.ProbeResult

@Composable
fun DashboardScreen(
    proMode: Boolean,
    onModeChange: (Boolean) -> Unit,
    isConnected: Boolean,
    isConnecting: Boolean,
    connectionSeconds: Long,
    selectedNode: ProbeResult,
    quickSwapNodes: List<ProbeResult>,
    activeProtocol: String,
    onProtocolSwitch: (String) -> Unit,
    mtuBytes: Int,
    killSwitch: Boolean,
    natT: Boolean,
    mobike: Boolean,
    dlHistory: List<Float>,
    ulHistory: List<Float>,
    rttHistory: List<Float>,
    handshakeTrace: HandshakeTrace?,
    isScanning: Boolean,
    onConnectToggle: () -> Unit,
    onSelectNode: (ProbeResult) -> Unit,
    onScanAll: () -> Unit,
    onReTrace: () -> Unit,
    onOpenDiagnostics: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Relay Context + Simple/Pro Mode Switcher (matches Web top workspace toolbar)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "\${selectedNode.city}, \${selectedNode.countryCode}",
                            color = ObsidianColors.TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp
                        )
                        Text(
                            text = "\${selectedNode.hostname} · \${selectedNode.rttMs} ms",
                            color = ObsidianColors.AccentCyan,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp
                        )
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = ObsidianColors.InsetBg,
                        border = BorderStroke(1.dp, ObsidianColors.BorderSubtle)
                    ) {
                        Row(modifier = Modifier.padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            listOf(false to "Simple", true to "Pro Telemetry").forEach { (isPro, label) ->
                                val active = proMode == isPro
                                Button(
                                    onClick = { onModeChange(isPro) },
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                    shape = RoundedCornerShape(7.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (active) ObsidianColors.PrimaryBlue else Color.Transparent,
                                        contentColor = if (active) Color(0xFFF8FAFC) else ObsidianColors.TextSecondary
                                    ),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Text(label, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                        }
                    }
                }
                HorizontalDivider(color = ObsidianColors.BorderSubtle)
            }
        }

        if (!proMode) {
            // SIMPLE MODE HERO PROTECTION CARD
            item {
                ObsidianCard(
                    borderColor = if (isConnected) ObsidianColors.StatusEmerald.copy(alpha = 0.55f) else ObsidianColors.BorderSubtle
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(9.dp)
                                .clip(CircleShape)
                                .background(if (isConnected) ObsidianColors.StatusEmerald else ObsidianColors.TextMuted)
                        )
                        Text(
                            text = if (isConnected) "Tunnel Protected" else "Unprotected Standby",
                            color = if (isConnected) ObsidianColors.StatusEmerald else ObsidianColors.TextSecondary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text("· $activeProtocol", color = ObsidianColors.TextMuted, fontSize = 12.sp)
                        if (isConnected) {
                            Text(
                                text = "· \${formatDuration(connectionSeconds)}",
                                color = ObsidianColors.AccentCyan,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Text(
                        text = if (isConnected) {
                            "Connected to \${selectedNode.city}, \${selectedNode.countryCode}"
                        } else {
                            "Fast 1-tap IKEv2 protection on verified clean relays"
                        },
                        color = ObsidianColors.TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 28.sp
                    )

                    Text(
                        text = if (isConnected) {
                            "Encrypted via \${selectedNode.hostname} (\${selectedNode.ip}) with \${mtuBytes}B MTU clamping and \${if (killSwitch) "Always-On Kill Switch" else "standard routing"}."
                        } else {
                            "Selected relay \${selectedNode.hostname} passed random fake-credential probing (\${selectedNode.rttMs} ms · \${selectedNode.load}% load). Real NordService password is requested on connect."
                        },
                        color = ObsidianColors.TextSecondary,
                        fontSize = 13.sp,
                        lineHeight = 19.sp
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = onConnectToggle,
                            enabled = !isConnecting,
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isConnected) ObsidianColors.ElevatedBg else ObsidianColors.PrimaryBlue
                            ),
                            border = if (isConnected) BorderStroke(1.dp, ObsidianColors.StatusEmerald.copy(alpha = 0.6f)) else null
                        ) {
                            Icon(Icons.Filled.Shield, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = when {
                                    isConnecting -> "Negotiating..."
                                    isConnected -> "Disconnect"
                                    else -> "Connect Best"
                                },
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp
                            )
                        }

                        OutlinedButton(
                            onClick = onScanAll,
                            enabled = !isScanning,
                            modifier = Modifier.height(48.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, ObsidianColors.BorderInput)
                        ) {
                            Icon(Icons.Filled.Refresh, contentDescription = null, tint = ObsidianColors.AccentCyan, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = if (isScanning) "Scanning..." else "Scan All",
                                color = ObsidianColors.TextPrimary,
                                fontSize = 13.sp
                            )
                        }
                    }

                    ObsidianInsetBox {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                SectionOverline("Target Relay")
                                Text(
                                    selectedNode.hostname,
                                    color = ObsidianColors.TextPrimary,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                SectionOverline("Ping")
                                Text(
                                    "\${selectedNode.rttMs} ms",
                                    color = ObsidianColors.StatusEmerald,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                            }
                        }
                        HorizontalDivider(color = ObsidianColors.BorderSubtle)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                SectionOverline("Gateway IP")
                                Text(selectedNode.ip, color = ObsidianColors.TextPrimary, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                SectionOverline("Fake-Cred Probe")
                                Text(
                                    if (selectedNode.banStatus == BanStatus.CLEAN) "Clean IP" else selectedNode.banStatus.name,
                                    color = ObsidianColors.StatusEmerald,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            // QUICK SERVER SWAP GRID
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Quick Server Swap", color = ObsidianColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        Text("Top vpnban relays", color = ObsidianColors.TextMuted, fontSize = 12.sp)
                    }

                    quickSwapNodes.chunked(2).forEach { pair ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            pair.forEach { node ->
                                val selected = node.hostname == selectedNode.hostname
                                ObsidianCard(
                                    modifier = Modifier.weight(1f),
                                    borderColor = if (selected) ObsidianColors.PrimaryBlue else ObsidianColors.BorderSubtle,
                                    containerColor = if (selected) ObsidianColors.PrimaryBlue.copy(alpha = 0.14f) else ObsidianColors.CardBg,
                                    onClick = { onSelectNode(node) }
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "\${node.city}, \${node.countryCode}",
                                            color = ObsidianColors.TextPrimary,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Text(
                                            text = "\${node.rttMs}ms",
                                            color = ObsidianColors.StatusEmerald,
                                            fontFamily = FontFamily.Monospace,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Text(
                                        text = node.hostname,
                                        color = ObsidianColors.TextSecondary,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 11.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "Load \${node.load}% · Score \${node.score}/100",
                                        color = ObsidianColors.TextMuted,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                            if (pair.size == 1) Spacer(Modifier.weight(1f))
                        }
                    }
                }
            }
        } else {
            // PRO TELEMETRY MODE — 2x2 KPI GRID
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        ObsidianCard(
                            modifier = Modifier.weight(1f),
                            borderColor = if (isConnected) ObsidianColors.PrimaryBlue.copy(alpha = 0.7f) else ObsidianColors.BorderSubtle
                        ) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                SectionOverline("Tunnel State")
                                Text(
                                    text = if (isConnected) formatDuration(connectionSeconds) else "IDLE",
                                    color = ObsidianColors.TextSecondary,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(
                                    imageVector = if (isConnected) Icons.Filled.Shield else Icons.Filled.Warning,
                                    contentDescription = null,
                                    tint = if (isConnected) ObsidianColors.StatusEmerald else ObsidianColors.StatusAmber,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = if (isConnected) "Established" else "Ready",
                                    color = ObsidianColors.TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                            }
                            Text(selectedNode.hostname, color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }

                        ObsidianCard(modifier = Modifier.weight(1f)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                SectionOverline("Throughput")
                                Icon(Icons.Filled.Speed, contentDescription = null, tint = ObsidianColors.AccentCyan, modifier = Modifier.size(15.dp))
                            }
                            val dl = if (isConnected) dlHistory.lastOrNull() ?: 264f else 0f
                            val ul = if (isConnected) ulHistory.lastOrNull() ?: 92f else 0f
                            MonoMetric("\${dl.toInt()}↓ \${ul.toInt()}↑", ObsidianColors.AccentCyan, sizeSp = 17)
                            Text("Mbps · MTU \${mtuBytes}B", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        ObsidianCard(modifier = Modifier.weight(1f)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                SectionOverline("RTT Latency")
                                Text("0% loss", color = ObsidianColors.StatusEmerald, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                            }
                            val rtt = rttHistory.lastOrNull()?.toInt() ?: selectedNode.rttMs.toInt()
                            MonoMetric("\${rtt} ms", ObsidianColors.TextPrimary, sizeSp = 18)
                            Text(
                                text = "\${if (natT) "NAT-T 4500" else "UDP 500"} · \${if (mobike) "MOBIKE" else "Static"}",
                                color = ObsidianColors.TextMuted,
                                fontSize = 11.sp
                            )
                        }

                        ObsidianCard(modifier = Modifier.weight(1f)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                SectionOverline("Kill Switch")
                                Text(
                                    if (killSwitch) "Strict" else "Std",
                                    color = ObsidianColors.StatusEmerald,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            MonoMetric(if (isConnected) selectedNode.ip else "Exposed", ObsidianColors.TextPrimary, sizeSp = 14)
                            Text("TUN: \${if (isConnected) "10.6.0.2/24" else "Inactive"}", color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        }
                    }
                }
            }

            // SPARKLINE TELEMETRY + MULTI-PROTOCOL PIVOT CARD
            item {
                ObsidianCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Packet Throughput & RTT", color = ObsidianColors.TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                            Text("AES-256-GCM / SHA-384 / MODP-2048", color = ObsidianColors.TextSecondary, fontSize = 11.sp)
                        }
                        Button(
                            onClick = onConnectToggle,
                            enabled = !isConnecting,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isConnected) ObsidianColors.ElevatedBg else ObsidianColors.PrimaryBlue
                            ),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(if (isConnecting) "Auth..." else if (isConnected) "Disconnect" else "Connect", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    ObsidianInsetBox {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Down / Up Throughput", color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                            Text(
                                text = if (isConnected) "\${dlHistory.lastOrNull()?.toInt() ?: 0} / \${ulHistory.lastOrNull()?.toInt() ?: 0} Mbps" else "Standby",
                                color = ObsidianColors.AccentCyan,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 12.sp
                            )
                        }
                        SparklineCanvas(
                            primaryValues = dlHistory,
                            secondaryValues = ulHistory,
                            maxValue = 450f,
                            primaryColor = ObsidianColors.AccentCyan,
                            secondaryColor = ObsidianColors.PrimaryBlue
                        )
                    }

                    ObsidianInsetBox {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Gateway RTT Window", color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                            Text(
                                text = "\${rttHistory.lastOrNull()?.toInt() ?: selectedNode.rttMs} ms",
                                color = ObsidianColors.StatusEmerald,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 12.sp
                            )
                        }
                        SparklineCanvas(
                            primaryValues = rttHistory,
                            maxValue = 180f,
                            primaryColor = ObsidianColors.StatusEmerald
                        )
                    }

                    SectionOverline("Multi-Protocol Pivot Stack")
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("IKEv2/IPSec", "NordLynx", "OpenVPN UDP").forEach { proto ->
                            val active = activeProtocol == proto
                            Button(
                                onClick = { onProtocolSwitch(proto) },
                                modifier = Modifier.weight(1f).height(38.dp),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 6.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (active) ObsidianColors.PrimaryBlue else ObsidianColors.InsetBg,
                                    contentColor = if (active) Color(0xFFF8FAFC) else ObsidianColors.TextSecondary
                                )
                            ) {
                                Text(proto, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
            }

            // 4-STAGE CRYPTOGRAPHIC ROUTING SUMMARY CARD
            item {
                ObsidianCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("4-Stage Cryptographic Routing", color = ObsidianColors.TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                            Text("ISAKMP & random fake-cred probe", color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                        }
                        OutlinedButton(
                            onClick = onReTrace,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ObsidianColors.BorderInput),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Filled.Refresh, contentDescription = null, tint = ObsidianColors.AccentCyan, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Trace", color = ObsidianColors.TextPrimary, fontSize = 12.sp)
                        }
                    }

                    val previewStages = handshakeTrace?.stages ?: listOf(
                        com.nord.ikev2explorer.scanner.HandshakeStage("dns", "DNS Resolution", "\${selectedNode.hostname} -> \${selectedNode.ip}", "passed", 6, ""),
                        com.nord.ikev2explorer.scanner.HandshakeStage("probe", "Gateway UDP Probe", "ISAKMP responder ready", "passed", selectedNode.rttMs, ""),
                        com.nord.ikev2explorer.scanner.HandshakeStage("ike_sa_init", "IKE_SA_INIT Exchange", "AES-256-GCM · SHA-384 · DH-14", "passed", 31, ""),
                        com.nord.ikev2explorer.scanner.HandshakeStage("ike_auth", "Random Fake-Cred Gate", selectedNode.wrongCredVerdict, if (selectedNode.banStatus == BanStatus.BANNED) "failed" else "passed", 42, "")
                    )

                    previewStages.forEachIndexed { idx, st ->
                        ObsidianInsetBox {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    modifier = Modifier.weight(1f),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = when (st.status) {
                                            "failed" -> Icons.Filled.Cancel
                                            "warning" -> Icons.Filled.Warning
                                            else -> Icons.Filled.CheckCircle
                                        },
                                        contentDescription = null,
                                        tint = when (st.status) {
                                            "failed" -> ObsidianColors.StatusCrimson
                                            "warning" -> ObsidianColors.StatusAmber
                                            else -> ObsidianColors.StatusEmerald
                                        },
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Column {
                                        Text("\${idx + 1}. \${st.label}", color = ObsidianColors.TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                        Text(st.detail, color = ObsidianColors.TextSecondary, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    }
                                }
                                Text("\${st.durationMs}ms", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Root CA: DigiCert / NordVPN", color = ObsidianColors.TextMuted, fontSize = 12.sp)
                        TextButton(onClick = onOpenDiagnostics) {
                            Text("Open Full Trace & Triage", color = ObsidianColors.AccentCyan, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/ScannerScreen.kt',
    language: 'kotlin',
    description: 'vpnban Full-List Async Scanner UI scanning ALL servers with random fake credentials, progress bar, search, region filters, and expandable probe verdicts',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nord.ikev2explorer.scanner.BanStatus
import com.nord.ikev2explorer.scanner.ProbeResult

@Composable
fun ScannerScreen(
    servers: List<ProbeResult>,
    totalCatalogCount: Int,
    probedCount: Int,
    totalToProbe: Int,
    isScanning: Boolean,
    isConnected: Boolean,
    connectedHostname: String?,
    workers: Int,
    timeoutMs: Int,
    probePort: Int,
    useRandomFakeCreds: Boolean,
    selectedHostname: String,
    onWorkersChange: (Int) -> Unit,
    onTimeoutChange: (Int) -> Unit,
    onPortChange: (Int) -> Unit,
    onToggleFakeCreds: () -> Unit,
    onScanAll: () -> Unit,
    onStopScan: () -> Unit,
    onConnectNode: (ProbeResult) -> Unit,
    onDisconnect: () -> Unit,
    onTraceNode: (ProbeResult) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var activeRegion by remember { mutableStateOf("All") }
    var cleanOnly by remember { mutableStateOf(false) }
    var sortBy by remember { mutableStateOf("score") }
    var expandedHost by remember { mutableStateOf<String?>(null) }

    val regions = listOf("All", "Europe", "North America", "Asia-Pacific", "Middle East & Africa", "South America")

    val filtered = remember(servers, searchQuery, activeRegion, cleanOnly, sortBy) {
        val q = searchQuery.trim().lowercase()
        servers.filter { s ->
            (activeRegion == "All" || s.region == activeRegion) &&
                (!cleanOnly || s.banStatus == BanStatus.CLEAN) &&
                (q.isEmpty() ||
                    s.hostname.lowercase().contains(q) ||
                    s.city.lowercase().contains(q) ||
                    s.country.lowercase().contains(q) ||
                    s.ip.contains(q))
        }.let { list ->
            when (sortBy) {
                "latency" -> list.sortedBy { it.rttMs }
                "load" -> list.sortedBy { it.load }
                else -> list.sortedByDescending { it.score }
            }
        }
    }

    val cleanCount = remember(servers) { servers.count { it.banStatus == BanStatus.CLEAN } }
    val testedTotal = remember(servers) { servers.count { it.banStatus != BanStatus.UNTESTED } }
    val cleanRate = if (testedTotal > 0) (cleanCount * 100f / testedTotal) else 0f
    val meanRtt = remember(servers) {
        val valid = servers.filter { it.banStatus != BanStatus.UNTESTED && it.rttMs > 0 }
        if (valid.isEmpty()) 0L else valid.sumOf { it.rttMs } / valid.size
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (isConnected && connectedHostname != null) {
            item {
                ObsidianCard(
                    borderColor = ObsidianColors.StatusEmerald.copy(alpha = 0.65f),
                    containerColor = ObsidianColors.InsetBg
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            SectionOverline("Active VPN Tunnel")
                            Text(
                                text = connectedHostname,
                                color = ObsidianColors.StatusEmerald,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        OutlinedButton(
                            onClick = onDisconnect,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ObsidianColors.StatusCrimson.copy(alpha = 0.7f)),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = null, tint = ObsidianColors.StatusCrimson, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Disconnect", color = ObsidianColors.StatusCrimson, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }

        // Fleet Telemetry Stats 2x2
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ObsidianCard(modifier = Modifier.weight(1f)) {
                        SectionOverline("Global Catalog")
                        MonoMetric("%,d".format(totalCatalogCount), ObsidianColors.TextPrimary, 20)
                        Text("NordVPN IKEv2 Fleet", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                    }
                    ObsidianCard(modifier = Modifier.weight(1f)) {
                        SectionOverline("Probed List")
                        MonoMetric("\$testedTotal / \${servers.size}", ObsidianColors.AccentCyan, 18)
                        Text(if (isScanning) "Scanning all..." else "Full list ready", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                    }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ObsidianCard(modifier = Modifier.weight(1f)) {
                        SectionOverline("Clean Rate")
                        MonoMetric("%.1f%%".format(cleanRate), ObsidianColors.StatusEmerald, 20)
                        Text("\$cleanCount clean IPs", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                    }
                    ObsidianCard(modifier = Modifier.weight(1f)) {
                        SectionOverline("Mean RTT")
                        MonoMetric("\${meanRtt} ms", ObsidianColors.TextPrimary, 20)
                        Text("UDP \$probePort · \${workers}w", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                    }
                }
            }
        }

        // vpnban Async Probe Engine Controls
        item {
            ObsidianCard(borderColor = if (isScanning) ObsidianColors.AccentCyan else ObsidianColors.BorderSubtle) {
                Text("vpnban Full-List Probe Engine", color = ObsidianColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                Text(
                    "Scans ALL \${servers.size} servers in the list using random fake usernames & passwords. Real password is requested only when connecting.",
                    color = ObsidianColors.TextSecondary,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = onScanAll,
                        enabled = !isScanning,
                        modifier = Modifier.weight(1f).height(46.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ObsidianColors.PrimaryBlue)
                    ) {
                        Icon(Icons.Filled.Sensors, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = if (isScanning) "Probing \$probedCount / \$totalToProbe..." else "Scan All \${servers.size} Servers",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp
                        )
                    }
                    if (isScanning) {
                        OutlinedButton(
                            onClick = onStopScan,
                            modifier = Modifier.height(46.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, ObsidianColors.StatusCrimson)
                        ) {
                            Icon(Icons.Filled.Stop, contentDescription = null, tint = ObsidianColors.StatusCrimson, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Stop", color = ObsidianColors.StatusCrimson, fontSize = 13.sp)
                        }
                    }
                }

                if (totalToProbe > 0 && (isScanning || probedCount > 0)) {
                    val pct = (probedCount.toFloat() / totalToProbe.toFloat()).coerceIn(0f, 1f)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(if (isScanning) "Scanning full server list..." else "Scan complete", color = ObsidianColors.TextSecondary, fontSize = 11.sp)
                            Text("\$probedCount / \$totalToProbe (\${(pct * 100).toInt()}%)", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        }
                        LinearProgressIndicator(
                            progress = { pct },
                            modifier = Modifier.fillMaxWidth().height(6.dp),
                            color = ObsidianColors.AccentCyan,
                            trackColor = ObsidianColors.InsetBg
                        )
                    }
                }

                HorizontalDivider(color = ObsidianColors.BorderSubtle)

                // Workers & Timeout Row
                SectionOverline("Async Workers & Timeout")
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(8, 16, 32, 64).forEach { w ->
                        val active = workers == w
                        Button(
                            onClick = { onWorkersChange(w) },
                            modifier = Modifier.weight(1f).height(34.dp),
                            shape = RoundedCornerShape(7.dp),
                            contentPadding = PaddingValues(0.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (active) ObsidianColors.PrimaryBlue else ObsidianColors.InsetBg,
                                contentColor = if (active) Color(0xFFF8FAFC) else ObsidianColors.TextSecondary
                            )
                        ) {
                            Text("\${w}w", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        }
                    }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(1500 to "1.5s", 2500 to "2.5s", 5000 to "5.0s").forEach { (ms, label) ->
                        val active = timeoutMs == ms
                        Button(
                            onClick = { onTimeoutChange(ms) },
                            modifier = Modifier.weight(1f).height(34.dp),
                            shape = RoundedCornerShape(7.dp),
                            contentPadding = PaddingValues(0.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (active) ObsidianColors.PrimaryBlue else ObsidianColors.InsetBg,
                                contentColor = if (active) Color(0xFFF8FAFC) else ObsidianColors.TextSecondary
                            )
                        ) {
                            Text(label, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        }
                    }
                    listOf(500 to "UDP 500", 4500 to "UDP 4500").forEach { (p, label) ->
                        val active = probePort == p
                        Button(
                            onClick = { onPortChange(p) },
                            modifier = Modifier.weight(1.2f).height(34.dp),
                            shape = RoundedCornerShape(7.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (active) ObsidianColors.PrimaryBlue else ObsidianColors.InsetBg,
                                contentColor = if (active) Color(0xFFF8FAFC) else ObsidianColors.TextSecondary
                            )
                        ) {
                            Text(label, fontFamily = FontFamily.Monospace, fontSize = 10.sp, maxLines = 1)
                        }
                    }
                }

                ObsidianInsetBox(
                    borderColor = if (useRandomFakeCreds) ObsidianColors.StatusEmerald.copy(alpha = 0.5f) else ObsidianColors.BorderSubtle
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Random Fake Auth Probe", color = ObsidianColors.TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            Text("Generates fresh fake user/pass for each node", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                        }
                        Switch(
                            checked = useRandomFakeCreds,
                            onCheckedChange = { onToggleFakeCreds() },
                            colors = SwitchDefaults.colors(checkedTrackColor = ObsidianColors.PrimaryBlue)
                        )
                    }
                }
            }
        }

        // Search + Filter Chips
        item {
            ObsidianCard {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null, tint = ObsidianColors.TextMuted) },
                    placeholder = { Text("Search all \${servers.size} nodes (host, city, IP)...", fontSize = 13.sp, color = ObsidianColors.TextMuted) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = ObsidianColors.InsetBg,
                        unfocusedContainerColor = ObsidianColors.InsetBg,
                        focusedBorderColor = ObsidianColors.AccentCyan,
                        unfocusedBorderColor = ObsidianColors.BorderInput,
                        focusedTextColor = ObsidianColors.TextPrimary,
                        unfocusedTextColor = ObsidianColors.TextPrimary
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    regions.forEach { reg ->
                        val active = activeRegion == reg
                        FilterChip(
                            selected = active,
                            onClick = { activeRegion = reg },
                            label = { Text(reg, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ObsidianColors.PrimaryBlue.copy(alpha = 0.22f),
                                selectedLabelColor = ObsidianColors.TextPrimary,
                                containerColor = ObsidianColors.InsetBg,
                                labelColor = ObsidianColors.TextSecondary
                            )
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("score" to "Score", "latency" to "Ping", "load" to "Load").forEach { (k, label) ->
                            FilterChip(
                                selected = sortBy == k,
                                onClick = { sortBy = k },
                                label = { Text(label, fontSize = 11.sp) }
                            )
                        }
                        FilterChip(
                            selected = cleanOnly,
                            onClick = { cleanOnly = !cleanOnly },
                            label = { Text("Clean", fontSize = 11.sp) }
                        )
                    }
                    Text("\${filtered.size} nodes", color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                }
            }
        }

        // Virtualized Server Rows (ALL matching servers, zero 10-server cap)
        itemsIndexed(filtered, key = { idx, srv -> "\${srv.hostname}_\$idx" }) { _, srv ->
            val isSelected = srv.hostname == selectedHostname
            val expanded = expandedHost == srv.hostname
            val statusColor = when (srv.banStatus) {
                BanStatus.CLEAN -> ObsidianColors.StatusEmerald
                BanStatus.THROTTLED -> ObsidianColors.StatusAmber
                BanStatus.UNTESTED -> ObsidianColors.TextMuted
                else -> ObsidianColors.StatusCrimson
            }

            ObsidianCard(
                borderColor = if (isSelected) ObsidianColors.PrimaryBlue else ObsidianColors.BorderSubtle,
                containerColor = if (isSelected) ObsidianColors.PrimaryBlue.copy(alpha = 0.11f) else ObsidianColors.CardBg
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "\${srv.city}, \${srv.countryCode} · \${srv.hostname}",
                            color = ObsidianColors.TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "\${srv.ip} · Load \${srv.load}% · Score \${srv.score}/100",
                            color = ObsidianColors.TextMuted,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = if (srv.banStatus == BanStatus.UNTESTED) "--" else "\${srv.rttMs} ms",
                            color = ObsidianColors.TextPrimary,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Text(
                            text = when (srv.banStatus) {
                                BanStatus.CLEAN -> "Clean IP"
                                BanStatus.THROTTLED -> "Throttled"
                                BanStatus.UNTESTED -> "Untested"
                                BanStatus.BANNED -> "Banned"
                                BanStatus.UNREACHABLE -> "Timeout"
                            },
                            color = statusColor,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                if (srv.banStatus != BanStatus.UNTESTED) {
                    Text(
                        text = "fake \${srv.fakeCredsUsed.username} : \${srv.fakeCredsUsed.password}",
                        color = ObsidianColors.AccentCyan,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val isNodeConnected = isConnected && srv.hostname == connectedHostname
                    if (isNodeConnected) {
                        OutlinedButton(
                            onClick = onDisconnect,
                            modifier = Modifier.weight(1f).height(38.dp),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ObsidianColors.StatusCrimson.copy(alpha = 0.7f))
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = null, tint = ObsidianColors.StatusCrimson, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Disconnect", color = ObsidianColors.StatusCrimson, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    } else {
                        Button(
                            onClick = { onConnectNode(srv) },
                            modifier = Modifier.weight(1f).height(38.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ObsidianColors.PrimaryBlue)
                        ) {
                            Icon(Icons.Filled.Shield, contentDescription = null, modifier = Modifier.size(15.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Connect", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                    OutlinedButton(
                        onClick = { expandedHost = if (expanded) null else srv.hostname },
                        modifier = Modifier.height(38.dp),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, ObsidianColors.BorderInput),
                        contentPadding = PaddingValues(horizontal = 10.dp)
                    ) {
                        Icon(
                            if (expanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = "Details",
                            tint = ObsidianColors.TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                if (expanded) {
                    ObsidianInsetBox {
                        SectionOverline("Random Fake Probe Verdict")
                        Text(srv.wrongCredVerdict, color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("Method: \${srv.probeMethod}", color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                            TextButton(onClick = { onTraceNode(srv) }) {
                                Text("Run 4-Stage Trace", color = ObsidianColors.AccentCyan, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/WorldMapScreen.kt',
    language: 'kotlin',
    description: 'Interactive Dark Vector Mercator World Map Canvas with glowing pins, Bezier tunnel arc, regional filters, and relay telemetry card',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.NetworkCheck
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nord.ikev2explorer.scanner.BanStatus
import com.nord.ikev2explorer.scanner.ProbeResult
import kotlin.math.hypot
import kotlin.math.min

private fun projectLonLat(lat: Double, lon: Double, w: Float, h: Float): Offset {
    val x = ((lon + 180.0) / 360.0 * w).toFloat()
    val y = ((90.0 - lat) / 180.0 * h).toFloat()
    return Offset(x, y)
}

@Composable
fun WorldMapScreen(
    servers: List<ProbeResult>,
    selectedNode: ProbeResult,
    isConnected: Boolean,
    onSelectNode: (ProbeResult) -> Unit,
    onConnectNode: (ProbeResult) -> Unit,
    onDisconnect: () -> Unit,
    onTraceNode: (ProbeResult) -> Unit
) {
    var activeRegion by remember { mutableStateOf("All") }
    val regions = listOf("All", "Europe", "North America", "Asia-Pacific", "Middle East & Africa", "South America")

    val plottedPins = remember(servers, activeRegion, selectedNode.hostname) {
        val filtered = if (activeRegion == "All") servers else servers.filter { it.region == activeRegion }
        val grid = LinkedHashMap<String, ProbeResult>()
        for (s in filtered) {
            val key = "\${(s.lat * 2).toInt()}_\${(s.lon * 2).toInt()}"
            val prev = grid[key]
            if (prev == null || s.hostname == selectedNode.hostname || (prev.hostname != selectedNode.hostname && s.score > prev.score)) {
                grid[key] = s
            }
        }
        grid.values.take(180)
    }

    val clusterStats = remember(servers) {
        servers.groupBy { it.region }.map { (region, list) ->
            val clean = list.count { it.banStatus == BanStatus.CLEAN }
            val avgRtt = list.map { it.rttMs }.average().toInt()
            Triple(region, clean to list.size, avgRtt)
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Global Relay Cartography", color = ObsidianColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text("Tap any pin to inspect vpnban status, latency, and connect", color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    regions.forEach { reg ->
                        FilterChip(
                            selected = activeRegion == reg,
                            onClick = { activeRegion = reg },
                            label = { Text(reg, fontSize = 11.sp) }
                        )
                    }
                }
            }
        }

        // Vector World Map Canvas
        item {
            ObsidianInsetBox {
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp)
                        .pointerInput(plottedPins) {
                            detectTapGestures { tap ->
                                val w = size.width.toFloat()
                                val h = size.height.toFloat()
                                val closest = plottedPins.minByOrNull { node ->
                                    val pt = projectLonLat(node.lat, node.lon, w, h)
                                    hypot(pt.x - tap.x, pt.y - tap.y)
                                }
                                if (closest != null) {
                                    val pt = projectLonLat(closest.lat, closest.lon, w, h)
                                    if (hypot(pt.x - tap.x, pt.y - tap.y) < 56f) {
                                        onSelectNode(closest)
                                    }
                                }
                            }
                        }
                ) {
                    val w = size.width
                    val h = size.height

                    // Graticule lines
                    for (i in 1..4) {
                        val y = h * (i / 5f)
                        drawLine(Color(0x0AFFFFFF), Offset(0f, y), Offset(w, y), 1f)
                    }
                    for (i in 1..5) {
                        val x = w * (i / 6f)
                        drawLine(Color(0x0AFFFFFF), Offset(x, 0f), Offset(x, h), 1f)
                    }

                    // Simplified Continent Polygons scaled 1000x500 -> Canvas size
                    fun poly(coords: List<Pair<Float, Float>>) {
                        val p = Path()
                        coords.forEachIndexed { idx, (cx, cy) ->
                            val sx = cx / 1000f * w
                            val sy = cy / 500f * h
                            if (idx == 0) p.moveTo(sx, sy) else p.lineTo(sx, sy)
                        }
                        p.close()
                        drawPath(p, color = ObsidianColors.CardBg)
                        drawPath(p, color = Color(0xFF31353E), style = Stroke(width = 1.5f, join = StrokeJoin.Round))
                    }

                    poly(listOf(95f to 72f, 175f to 60f, 265f to 68f, 325f to 120f, 265f to 172f, 222f to 222f, 175f to 185f, 82f to 95f)) // N.America
                    poly(listOf(255f to 232f, 302f to 228f, 368f to 302f, 282f to 442f, 245f to 280f)) // S.America
                    poly(listOf(455f to 148f, 518f to 86f, 585f to 95f, 555f to 158f, 465f to 165f)) // Europe
                    poly(listOf(458f to 175f, 568f to 195f, 590f to 295f, 525f to 382f, 455f to 235f)) // Africa
                    poly(listOf(580f to 82f, 785f to 70f, 912f to 115f, 795f to 212f, 655f to 205f, 582f to 148f)) // Asia
                    poly(listOf(792f to 315f, 868f to 308f, 908f to 342f, 842f to 395f, 795f to 366f)) // Australia

                    // Curved Tunnel Arc
                    val origin = projectLonLat(40.71, -74.0, w, h)
                    val dest = projectLonLat(selectedNode.lat, selectedNode.lon, w, h)
                    val arc = Path().apply {
                        moveTo(origin.x, origin.y)
                        quadraticBezierTo(
                            (origin.x + dest.x) / 2f,
                            min(origin.y, dest.y) - h * 0.16f,
                            dest.x,
                            dest.y
                        )
                    }
                    drawPath(
                        path = arc,
                        color = if (isConnected) ObsidianColors.StatusEmerald else ObsidianColors.AccentCyan,
                        style = Stroke(width = 3f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 6f), 0f))
                    )

                    // Origin Dot
                    drawCircle(ObsidianColors.TextPrimary, radius = 6f, center = origin)

                    // Gateway Pins
                    for (srv in plottedPins) {
                        val pt = projectLonLat(srv.lat, srv.lon, w, h)
                        val isSel = srv.hostname == selectedNode.hostname
                        val pinColor = when {
                            isSel -> ObsidianColors.AccentCyan
                            srv.banStatus == BanStatus.CLEAN -> ObsidianColors.StatusEmerald
                            srv.banStatus == BanStatus.THROTTLED -> ObsidianColors.StatusAmber
                            srv.banStatus == BanStatus.UNTESTED -> ObsidianColors.PrimaryBlue
                            else -> ObsidianColors.StatusCrimson
                        }
                        if (isSel) {
                            drawCircle(ObsidianColors.AccentCyan.copy(alpha = 0.45f), radius = 18f, center = pt, style = Stroke(width = 2.5f))
                        }
                        drawCircle(pinColor, radius = if (isSel) 9f else 5.5f, center = pt)
                    }
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Green: Clean · Amber: Throttled · Cyan: Selected", color = ObsidianColors.TextMuted, fontSize = 10.sp)
                    Text("\${plottedPins.size} pins", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
                }
            }
        }

        // Selected Relay Details Card
        item {
            ObsidianCard(borderColor = ObsidianColors.PrimaryBlue.copy(alpha = 0.6f)) {
                Text(selectedNode.region, color = ObsidianColors.AccentCyan, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                Text("\${selectedNode.city}, \${selectedNode.country}", color = ObsidianColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                Text("\${selectedNode.hostname} · \${selectedNode.ip}", color = ObsidianColors.TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 12.sp)

                ObsidianInsetBox {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column { SectionOverline("Ping"); MonoMetric("\${selectedNode.rttMs} ms", ObsidianColors.StatusEmerald, 15) }
                        Column { SectionOverline("Load"); MonoMetric("\${selectedNode.load}%", ObsidianColors.TextPrimary, 15) }
                        Column { SectionOverline("Score"); MonoMetric("\${selectedNode.score}/100", ObsidianColors.AccentCyan, 15) }
                    }
                    Text(selectedNode.wrongCredVerdict, color = ObsidianColors.TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (isConnected) {
                        OutlinedButton(
                            onClick = onDisconnect,
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, ObsidianColors.StatusCrimson.copy(alpha = 0.7f))
                        ) {
                            Text("Disconnect", color = ObsidianColors.StatusCrimson, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    } else {
                        Button(
                            onClick = { onConnectNode(selectedNode) },
                            modifier = Modifier.weight(1f).height(44.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ObsidianColors.PrimaryBlue)
                        ) {
                            Icon(Icons.Filled.Shield, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Connect Relay", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                    OutlinedButton(
                        onClick = { onTraceNode(selectedNode) },
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, ObsidianColors.BorderInput)
                    ) {
                        Icon(Icons.Filled.NetworkCheck, contentDescription = null, tint = ObsidianColors.AccentCyan, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Trace Path", color = ObsidianColors.TextPrimary, fontSize = 12.sp)
                    }
                }
            }
        }

        // Regional Cluster Health
        item {
            ObsidianCard {
                Text("Regional Cluster Health", color = ObsidianColors.TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                clusterStats.forEach { (region, counts, avgRtt) ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(region, color = ObsidianColors.TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            Text("\${counts.first}/\${counts.second} clean nodes", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                        }
                        Text("~\${avgRtt} ms", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                    }
                    HorizontalDivider(color = ObsidianColors.BorderSubtle)
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/DiagnosticsScreen.kt',
    language: 'kotlin',
    description: '4-Stage ISAKMP Handshake Trace, Packet Hex Previews, Carrier Fault Triage Actions, and Session Log Console',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nord.ikev2explorer.scanner.HandshakeTrace
import com.nord.ikev2explorer.scanner.ProbeResult

@Composable
fun DiagnosticsScreen(
    selectedNode: ProbeResult,
    trace: HandshakeTrace?,
    isTracing: Boolean,
    mtuBytes: Int,
    natT: Boolean,
    logs: List<String>,
    onRunTrace: (Boolean) -> Unit,
    onApplyTriage: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            ObsidianCard {
                Text("ISAKMP Handshake Trace & Triage", color = ObsidianColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(
                    "Gateway: \${selectedNode.hostname} (\${selectedNode.ip}) · MTU \${mtuBytes}B · \${if (natT) "NAT-T UDP 4500" else "UDP 500"}",
                    color = ObsidianColors.TextSecondary,
                    fontSize = 12.sp
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { onRunTrace(false) },
                        enabled = !isTracing,
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ObsidianColors.PrimaryBlue)
                    ) {
                        Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(if (isTracing) "Tracing..." else "Run 4-Stage Trace", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    OutlinedButton(
                        onClick = { onRunTrace(true) },
                        enabled = !isTracing,
                        modifier = Modifier.height(44.dp),
                        shape = RoundedCornerShape(10.dp),
                        border = BorderStroke(1.dp, ObsidianColors.StatusAmber.copy(alpha = 0.6f))
                    ) {
                        Icon(Icons.Filled.Warning, contentDescription = null, tint = ObsidianColors.StatusAmber, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Fault Test", color = ObsidianColors.StatusAmber, fontSize = 12.sp)
                    }
                }
            }
        }

        // Automated Triage Card
        if (trace?.triageDetected == true) {
            item {
                ObsidianCard(
                    borderColor = ObsidianColors.StatusCrimson.copy(alpha = 0.6f),
                    containerColor = ObsidianColors.StatusCrimson.copy(alpha = 0.08f)
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.Cancel, contentDescription = null, tint = ObsidianColors.StatusCrimson)
                        Column {
                            Text(trace.triageCode, color = ObsidianColors.StatusCrimson, fontFamily = FontFamily.Monospace, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text(trace.triageTitle, color = ObsidianColors.TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text(trace.triageExplanation, color = ObsidianColors.TextSecondary, fontSize = 12.sp, lineHeight = 17.sp)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("mtu_1380" to "Clamp MTU 1380B", "enable_natt" to "Force NAT-T 4500").forEach { (id, lbl) ->
                            OutlinedButton(
                                onClick = { onApplyTriage(id) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, ObsidianColors.AccentCyan.copy(alpha = 0.5f))
                            ) {
                                Icon(Icons.Filled.Build, contentDescription = null, tint = ObsidianColors.AccentCyan, modifier = Modifier.size(14.dp))
                                Spacer(Modifier.width(4.dp))
                                Text(lbl, color = ObsidianColors.AccentCyan, fontSize = 11.sp)
                            }
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("reroute_clean" to "Auto-Reroute Clean", "switch_nordlynx" to "Pivot NordLynx").forEach { (id, lbl) ->
                            OutlinedButton(
                                onClick = { onApplyTriage(id) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                border = BorderStroke(1.dp, ObsidianColors.AccentCyan.copy(alpha = 0.5f))
                            ) {
                                Text(lbl, color = ObsidianColors.TextPrimary, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // 4-Stage Stepper
        item {
            ObsidianCard {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("4-Stage ISAKMP Pipeline", color = ObsidianColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                    if (trace != null) {
                        Text("\${trace.totalDurationMs} ms", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                    }
                }

                if (trace == null) {
                    ObsidianInsetBox {
                        Text(
                            "Tap 'Run 4-Stage Trace' to inspect DNS resolution, UDP 500/4500 probe, IKE_SA_INIT negotiation, and random fake-credential check.",
                            color = ObsidianColors.TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                } else {
                    ObsidianInsetBox {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Random Fake Probe Pair:", color = ObsidianColors.TextMuted, fontSize = 11.sp)
                            Text(
                                "\${trace.fakeCreds.username} : \${trace.fakeCreds.password}",
                                color = ObsidianColors.AccentCyan,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp
                            )
                        }
                    }

                    trace.stages.forEachIndexed { idx, st ->
                        ObsidianInsetBox {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = when (st.status) {
                                            "failed" -> Icons.Filled.Cancel
                                            "warning" -> Icons.Filled.Warning
                                            else -> Icons.Filled.CheckCircle
                                        },
                                        contentDescription = null,
                                        tint = when (st.status) {
                                            "failed" -> ObsidianColors.StatusCrimson
                                            "warning" -> ObsidianColors.StatusAmber
                                            else -> ObsidianColors.StatusEmerald
                                        },
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text("Stage \${idx + 1}: \${st.label}", color = ObsidianColors.TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                }
                                Text("\${st.durationMs} ms", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                            }
                            Text(st.detail, color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                            if (st.packetHex.isNotBlank()) {
                                Surface(color = ObsidianColors.CanvasBg, shape = RoundedCornerShape(6.dp)) {
                                    Text(
                                        st.packetHex,
                                        color = Color(0xFFBDF4FF),
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 10.sp,
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Session Diagnostic Log Console
        item {
            ObsidianCard {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Session Diagnostic Logs", color = ObsidianColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                    Text("\${logs.size} events", color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                }
                ObsidianInsetBox {
                    if (logs.isEmpty()) {
                        Text("No events logged yet.", color = ObsidianColors.TextMuted, fontSize = 12.sp)
                    } else {
                        logs.take(40).forEach { line ->
                            Text(line, color = ObsidianColors.TextSecondary, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                            HorizontalDivider(color = ObsidianColors.BorderSubtle)
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/ui/VaultScreen.kt',
    language: 'kotlin',
    description: 'Hardware Keystore AES-256-GCM Credentials Vault, Obsidian App Icon card, Root CA Pinning, and IPSec Baseband Stack Switches',
    content: `package com.nord.ikev2explorer.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VaultScreen(
    serviceUsername: String,
    servicePassword: String,
    natTraversal: Boolean,
    mobike: Boolean,
    mtuClamping: Boolean,
    killSwitch: Boolean,
    cipherSuite: String,
    rootCaVerified: Boolean,
    onSaveCredentials: (String, String) -> Unit,
    onToggleNatT: (Boolean) -> Unit,
    onToggleMobike: (Boolean) -> Unit,
    onToggleMtu: (Boolean) -> Unit,
    onToggleKillSwitch: (Boolean) -> Unit,
    onCipherChange: (String) -> Unit,
    onVerifyRootCa: () -> Unit
) {
    var userInput by remember(serviceUsername) { mutableStateOf(serviceUsername) }
    var passInput by remember(servicePassword) { mutableStateOf(servicePassword) }
    var showPass by remember { mutableStateOf(false) }
    var savedBanner by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // App Icon & Version Banner
        item {
            ObsidianCard {
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    ObsidianAppIcon(size = 56.dp)
                    Column {
                        Text("NordVPN IKEv2 Explorer", color = ObsidianColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                        Text("Version v.0.0.1 · Android 6.0+ (API 23–35)", color = ObsidianColors.AccentCyan, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                        Text("AES-256-GCM Hardware Keystore Vault", color = ObsidianColors.TextSecondary, fontSize = 12.sp)
                    }
                }
            }
        }

        // NordService Keystore Credentials
        item {
            ObsidianCard {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Filled.VpnKey, contentDescription = null, tint = ObsidianColors.AccentCyan)
                        Text("NordService Keystore Vault", color = ObsidianColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                    Text("AES-256-GCM", color = ObsidianColors.StatusEmerald, fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                }

                OutlinedTextField(
                    value = userInput,
                    onValueChange = { userInput = it },
                    label = { Text("Correct NordService Username") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = ObsidianColors.InsetBg,
                        unfocusedContainerColor = ObsidianColors.InsetBg,
                        focusedBorderColor = ObsidianColors.AccentCyan,
                        unfocusedBorderColor = ObsidianColors.BorderInput
                    )
                )

                OutlinedTextField(
                    value = passInput,
                    onValueChange = { passInput = it },
                    label = { Text("Correct NordService Password") },
                    singleLine = true,
                    visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { showPass = !showPass }) {
                            Icon(if (showPass) Icons.Filled.VisibilityOff else Icons.Filled.Visibility, contentDescription = "Toggle password")
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = ObsidianColors.InsetBg,
                        unfocusedContainerColor = ObsidianColors.InsetBg,
                        focusedBorderColor = ObsidianColors.AccentCyan,
                        unfocusedBorderColor = ObsidianColors.BorderInput
                    )
                )

                ObsidianInsetBox {
                    Text("Scan Isolation Policy (vpnban)", color = ObsidianColors.AccentCyan, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Text(
                        "Every server probe generates a fresh random fake username and password (probe_xxxxxxxx : fake_xxxxxxxxxxxx). Your real credentials are used strictly on Connect.",
                        color = ObsidianColors.TextSecondary,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }

                ObsidianInsetBox {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("DigiCert & NordVPN Root CA", color = ObsidianColors.TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            Text("SHA-256: 43:48:A0:E9:44:4C:78:CB...", color = ObsidianColors.TextMuted, fontFamily = FontFamily.Monospace, fontSize = 10.sp)
                        }
                        OutlinedButton(
                            onClick = onVerifyRootCa,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ObsidianColors.BorderInput)
                        ) {
                            Text(if (rootCaVerified) "Verified" else "Verify", color = ObsidianColors.StatusEmerald, fontSize = 11.sp)
                        }
                    }
                }

                Button(
                    onClick = {
                        onSaveCredentials(userInput.trim(), passInput)
                        savedBanner = true
                    },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ObsidianColors.PrimaryBlue)
                ) {
                    Icon(Icons.Filled.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(if (savedBanner) "Saved to Android Keystore ✓" else "Save Real Credentials", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // IPSec & Mobile Baseband Stack Switches
        item {
            ObsidianCard {
                Text("IPSec & Mobile Baseband Stack", color = ObsidianColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                listOf(
                    Triple("NAT-Traversal (UDP 4500)", "Encapsulates ESP packets in UDP 4500", natTraversal to onToggleNatT),
                    Triple("MOBIKE Roaming (RFC 4555)", "Seamless Wi-Fi <-> 5G/LTE tunnel handoff", mobike to onToggleMobike),
                    Triple("Baseband MTU Clamping (1380B)", "Eliminates mobile carrier fragmentation", mtuClamping to onToggleMtu),
                    Triple("Always-On Kill Switch", "Blocks cleartext traffic if SA drops", killSwitch to onToggleKillSwitch)
                ).forEach { (title, desc, pair) ->
                    ObsidianInsetBox {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(title, color = ObsidianColors.TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                Text(desc, color = ObsidianColors.TextMuted, fontSize = 11.sp)
                            }
                            Switch(
                                checked = pair.first,
                                onCheckedChange = pair.second,
                                colors = SwitchDefaults.colors(checkedTrackColor = ObsidianColors.PrimaryBlue)
                            )
                        }
                    }
                }

                SectionOverline("Negotiated IPSec Cipher Suite")
                listOf(
                    "AES-256-GCM / SHA-384 / MODP-2048",
                    "AES-256-CBC / SHA-256 / MODP-2048",
                    "ChaCha20-Poly1305 / SHA-512"
                ).forEach { suite ->
                    FilterChip(
                        selected = cipherSuite == suite,
                        onClick = { onCipherChange(suite) },
                        label = { Text(suite, fontFamily = FontFamily.Monospace, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
`,
  },
];
